<?php
/**
 * Better Change: push a content snapshot from betterchange-consulting.com
 * to betterchange-consulting.de.
 *
 * Installed on the .com site through the Code Snippets plugin (see
 * docs/com-snapshot-setup.md in the .de repository). Once a day, and a couple
 * of minutes after a post or event is saved, it collects:
 *   - metadata for every published post (full content only for posts
 *     published in the last 60 days),
 *   - every upcoming event from The Events Calendar,
 *   - the same for any other public custom post type,
 *   - the list of post types,
 * using WordPress's own REST handling, so the JSON has the shape the REST
 * API would return, and POSTs it to the .de site's com-snapshot Netlify
 * Function with a shared secret header. Nothing on .com is changed.
 *
 * The secret is read from the BC_SYNC_SECRET constant in wp-config.php
 * (preferred) or, failing that, the bc_sync_secret option. Never paste it
 * into this snippet.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('BC_SYNC_ENDPOINT')) {
    define('BC_SYNC_ENDPOINT', 'https://betterchange-consulting.de/.netlify/functions/com-snapshot');
}
if (!defined('BC_SYNC_CONTENT_DAYS')) {
    define('BC_SYNC_CONTENT_DAYS', 60);
}
if (!defined('BC_SYNC_DEBOUNCE_SECONDS')) {
    define('BC_SYNC_DEBOUNCE_SECONDS', 120);
}
if (!defined('BC_SYNC_HOOK')) {
    define('BC_SYNC_HOOK', 'bc_sync_push_snapshot');
}

// ------------------------------------------------------------------ secret --
function bc_sync_secret(): string
{
    if (defined('BC_SYNC_SECRET') && BC_SYNC_SECRET !== '') {
        return (string) BC_SYNC_SECRET;
    }
    return (string) get_option('bc_sync_secret', '');
}

// ------------------------------------------------------------- scheduling --
// Daily run at 03:10 site time; the .de sync session runs later in the day.
add_action('init', function () {
    if (!wp_next_scheduled(BC_SYNC_HOOK, ['daily'])) {
        $tz    = wp_timezone();
        $first = new DateTime('tomorrow 03:10', $tz);
        wp_schedule_event($first->getTimestamp(), 'daily', BC_SYNC_HOOK, ['daily']);
    }
});

add_action(BC_SYNC_HOOK, 'bc_sync_push_snapshot');

// Post types worth syncing: posts, events, and any public custom post type
// that is exposed over REST (Custom Post Type UI types qualify). Venues,
// organizers, attachments and the like are left out.
function bc_sync_post_types(): array
{
    $types = ['post', 'tribe_events'];
    foreach (get_post_types(['public' => true, 'show_in_rest' => true, '_builtin' => false], 'objects') as $slug => $obj) {
        if (strpos($slug, 'tribe_') === 0 || strpos($slug, 'elementor_') === 0 || strpos($slug, 'tec_') === 0 || $slug === 'attachment') {
            continue;
        }
        $types[] = $slug;
    }
    return array_values(array_unique($types));
}

// A save, trash or delete of a relevant post schedules ONE push a couple of
// minutes later, however many saves happen in between.
function bc_sync_schedule_soon($post_id): void
{
    $post = get_post($post_id);
    if (!$post || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    if (!in_array($post->post_type, bc_sync_post_types(), true)) {
        return;
    }
    if (!wp_next_scheduled(BC_SYNC_HOOK, ['save'])) {
        wp_schedule_single_event(time() + BC_SYNC_DEBOUNCE_SECONDS, BC_SYNC_HOOK, ['save']);
    }
}
add_action('save_post', 'bc_sync_schedule_soon', 20);
add_action('trashed_post', 'bc_sync_schedule_soon', 20);
add_action('untrashed_post', 'bc_sync_schedule_soon', 20);
add_action('before_delete_post', 'bc_sync_schedule_soon', 20);

// --------------------------------------------------------------- REST read --
// Runs a GET against this site's own REST API in-process. Returns
// [data, headers] with embedded objects resolved when $params has _embed.
function bc_sync_rest(string $route, array $params = []): array
{
    $request = new WP_REST_Request('GET', $route);
    foreach ($params as $key => $value) {
        $request->set_param($key, $value);
    }
    $response = rest_do_request($request);
    if ($response->is_error()) {
        return [null, [], $response->as_error()->get_error_message()];
    }
    $data = rest_get_server()->response_to_data($response, isset($params['_embed']));
    return [$data, $response->get_headers(), null];
}

function bc_sync_trim_terms($embedded): array
{
    $out = [];
    foreach ((array) ($embedded['wp:term'] ?? []) as $group) {
        $g = [];
        foreach ((array) $group as $term) {
            $g[] = [
                'taxonomy' => $term['taxonomy'] ?? null,
                'slug'     => $term['slug'] ?? null,
                'name'     => $term['name'] ?? null,
                'link'     => $term['link'] ?? null,
            ];
        }
        $out[] = $g;
    }
    return $out;
}

// Keeps what the sync needs and drops the bulk (links, media size lists,
// and the full content of anything older than BC_SYNC_CONTENT_DAYS).
function bc_sync_trim_post(array $p, string $type): array
{
    $cutoff   = time() - BC_SYNC_CONTENT_DAYS * DAY_IN_SECONDS;
    $date_gmt = $p['date_gmt'] ?? $p['date'] ?? null;
    $recent   = $date_gmt && strtotime($date_gmt . ' UTC') >= $cutoff;
    $embedded = $p['_embedded'] ?? [];
    $author   = $embedded['author'][0] ?? null;
    $media    = $embedded['wp:featuredmedia'][0] ?? null;

    $out = [
        'id'           => $p['id'] ?? null,
        'type'         => $type,
        'status'       => $p['status'] ?? null,
        'date'         => $p['date'] ?? null,
        'date_gmt'     => $date_gmt,
        'modified'     => $p['modified'] ?? null,
        'modified_gmt' => $p['modified_gmt'] ?? null,
        'slug'         => $p['slug'] ?? null,
        'link'         => $p['link'] ?? null,
        'title'        => ['rendered' => $p['title']['rendered'] ?? ''],
        'excerpt'      => ['rendered' => $p['excerpt']['rendered'] ?? ''],
        'categories'   => $p['categories'] ?? [],
        'tags'         => $p['tags'] ?? [],
        'author'       => $p['author'] ?? null,
        'lang'         => $p['lang'] ?? ($p['language'] ?? null),
        'hasContent'   => (bool) $recent,
        '_embedded'    => [
            'author'  => $author ? [['name' => $author['name'] ?? null, 'slug' => $author['slug'] ?? null, 'link' => $author['link'] ?? null]] : [],
            'wp:term' => bc_sync_trim_terms($embedded),
            'wp:featuredmedia' => $media ? [['source_url' => $media['source_url'] ?? null, 'alt_text' => $media['alt_text'] ?? null]] : [],
        ],
    ];
    if ($recent) {
        $out['content'] = ['rendered' => $p['content']['rendered'] ?? ''];
    }
    return $out;
}

function bc_sync_collect_type(string $rest_base, string $type): array
{
    $items = [];
    for ($page = 1; $page <= 50; $page++) {
        [$data, $headers, $error] = bc_sync_rest("/wp/v2/{$rest_base}", [
            'per_page' => 100,
            'page'     => $page,
            'status'   => 'publish',
            'orderby'  => 'date',
            'order'    => 'desc',
            '_embed'   => true,
        ]);
        if ($error !== null || !is_array($data)) {
            break;
        }
        foreach ($data as $p) {
            $items[] = bc_sync_trim_post((array) $p, $type);
        }
        $total_pages = (int) ($headers['X-WP-TotalPages'] ?? 1);
        if ($page >= $total_pages || count($data) === 0) {
            break;
        }
    }
    return $items;
}

function bc_sync_trim_event(array $e): array
{
    $venue = $e['venue'] ?? null;
    if (is_array($venue) && isset($venue[0])) {
        $venue = $venue[0];
    }
    $organizers = [];
    foreach ((array) ($e['organizer'] ?? []) as $o) {
        if (is_array($o)) {
            $organizers[] = ['id' => $o['id'] ?? null, 'organizer' => $o['organizer'] ?? null, 'url' => $o['url'] ?? null];
        }
    }
    $categories = [];
    foreach ((array) ($e['categories'] ?? []) as $c) {
        if (is_array($c)) {
            $categories[] = ['slug' => $c['slug'] ?? null, 'name' => $c['name'] ?? null];
        }
    }
    return [
        'id'             => $e['id'] ?? null,
        'status'         => $e['status'] ?? null,
        'title'          => $e['title'] ?? '',
        'url'            => $e['url'] ?? null,
        'excerpt'        => $e['excerpt'] ?? '',
        'description'    => $e['description'] ?? '',
        'start_date'     => $e['start_date'] ?? null,
        'end_date'       => $e['end_date'] ?? null,
        'utc_start_date' => $e['utc_start_date'] ?? null,
        'utc_end_date'   => $e['utc_end_date'] ?? null,
        'modified_utc'   => $e['modified_utc'] ?? ($e['modified'] ?? null),
        'cost'           => $e['cost'] ?? null,
        'cost_details'   => $e['cost_details'] ?? null,
        'website'        => $e['website'] ?? null,
        'venue'          => is_array($venue) && !empty($venue) ? [
            'id'      => $venue['id'] ?? null,
            'venue'   => $venue['venue'] ?? null,
            'address' => $venue['address'] ?? null,
            'city'    => $venue['city'] ?? null,
            'country' => $venue['country'] ?? null,
        ] : [],
        'organizer'      => $organizers,
        'categories'     => $categories,
        'custom_fields'  => $e['custom_fields'] ?? null,
        'trainer'        => bc_sync_event_trainer($e),
    ];
}

// The "Trainer" additional field (The Events Calendar Pro). Read by its label
// so the meta key (_ecp_custom_N) does not matter, with the REST
// custom_fields block as the fallback in either shape it comes in. The .de
// sync takes the trainer from here first, before the organizer and the
// description.
function bc_sync_event_trainer(array $e): ?string
{
    $id = (int) ($e['id'] ?? 0);
    if ($id && function_exists('tribe_get_custom_field')) {
        $v = tribe_get_custom_field('Trainer', $id);
        if (is_string($v) && trim($v) !== '') {
            return trim(wp_strip_all_tags($v));
        }
    }
    foreach ((array) ($e['custom_fields'] ?? []) as $k => $v) {
        if (is_array($v)) {
            $label = (string) ($v['label'] ?? ($v['name'] ?? ''));
            $value = $v['value'] ?? '';
        } else {
            $label = (string) $k;
            $value = $v;
        }
        if (is_string($value) && trim($value) !== '' && preg_match('/trainer/i', $label)) {
            return trim(wp_strip_all_tags($value));
        }
    }
    return null;
}

function bc_sync_collect_events(): array
{
    $events = [];
    $today  = current_time('Y-m-d');
    for ($page = 1; $page <= 50; $page++) {
        [$data, $headers, $error] = bc_sync_rest('/tribe/events/v1/events', [
            'per_page'   => 50,
            'page'       => $page,
            'start_date' => $today,
            'status'     => 'publish',
        ]);
        if ($error !== null || !is_array($data)) {
            break;
        }
        foreach ((array) ($data['events'] ?? []) as $e) {
            $events[] = bc_sync_trim_event((array) $e);
        }
        $total_pages = (int) ($data['total_pages'] ?? 1);
        if ($page >= $total_pages) {
            break;
        }
    }
    return $events;
}

function bc_sync_build_snapshot(string $trigger): array
{
    [$types] = bc_sync_rest('/wp/v2/types');
    $type_list = [];
    foreach ((array) $types as $slug => $t) {
        $type_list[$slug] = ['name' => $t['name'] ?? $slug, 'slug' => $slug, 'rest_base' => $t['rest_base'] ?? $slug];
    }

    $extra = [];
    foreach (bc_sync_post_types() as $slug) {
        if ($slug === 'post' || $slug === 'tribe_events') {
            continue;
        }
        $rest_base = $type_list[$slug]['rest_base'] ?? $slug;
        $extra[$slug] = [
            'name'      => $type_list[$slug]['name'] ?? $slug,
            'rest_base' => $rest_base,
            'items'     => bc_sync_collect_type($rest_base, $slug),
        ];
    }

    return [
        'version'     => 1,
        'generatedAt' => gmdate('c'),
        'site'        => home_url(),
        'trigger'     => $trigger,
        'contentDays' => BC_SYNC_CONTENT_DAYS,
        'types'       => $type_list,
        'posts'       => bc_sync_collect_type('posts', 'post'),
        'events'      => bc_sync_collect_events(),
        'extraTypes'  => $extra,
    ];
}

// ------------------------------------------------------------------- push --
function bc_sync_push_snapshot($trigger = 'manual')
{
    $trigger = is_string($trigger) ? $trigger : 'cron';
    $secret  = bc_sync_secret();
    $record  = ['at' => gmdate('c'), 'trigger' => $trigger];

    if ($secret === '') {
        $record['ok']    = false;
        $record['error'] = 'No secret configured (BC_SYNC_SECRET in wp-config.php).';
        update_option('bc_sync_last_push', $record, false);
        return $record;
    }

    $snapshot = bc_sync_build_snapshot($trigger);
    $body     = wp_json_encode($snapshot);
    if ($body === false) {
        $record['ok']    = false;
        $record['error'] = 'Could not encode the snapshot as JSON.';
        update_option('bc_sync_last_push', $record, false);
        return $record;
    }

    $response = wp_remote_post(BC_SYNC_ENDPOINT, [
        'timeout' => 60,
        'headers' => [
            'Content-Type'  => 'application/json',
            'X-Sync-Secret' => $secret,
            'User-Agent'    => 'betterchange-com-snapshot/1 (' . home_url() . ')',
        ],
        'body'    => $body,
    ]);

    $record['posts']  = count($snapshot['posts']);
    $record['events'] = count($snapshot['events']);
    $record['bytes']  = strlen($body);
    if (is_wp_error($response)) {
        $record['ok']    = false;
        $record['error'] = $response->get_error_message();
    } else {
        $code             = (int) wp_remote_retrieve_response_code($response);
        $record['status'] = $code;
        $record['ok']     = $code >= 200 && $code < 300;
        $record['reply']  = substr((string) wp_remote_retrieve_body($response), 0, 300);
    }
    update_option('bc_sync_last_push', $record, false);
    return $record;
}

// ---------------------------------------------------- admin: push now + status --
add_action('admin_post_bc_sync_push', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('bc_sync_push')) {
        wp_die('Not allowed.');
    }
    $record = bc_sync_push_snapshot('manual');
    header('Content-Type: text/plain; charset=utf-8');
    echo "Better Change snapshot push\n\n";
    echo wp_json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    echo "\n\nBack: " . admin_url() . "\n";
    exit;
});

add_action('admin_notices', function () {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (!$screen || $screen->id !== 'dashboard' || !current_user_can('manage_options')) {
        return;
    }
    $last = get_option('bc_sync_last_push');
    $url  = wp_nonce_url(admin_url('admin-post.php?action=bc_sync_push'), 'bc_sync_push');
    if (!$last) {
        $text  = 'Snapshot push to betterchange-consulting.de: not run yet.';
        $class = 'notice-info';
    } elseif (!empty($last['ok'])) {
        $text  = sprintf('Snapshot push to betterchange-consulting.de: OK at %s (%s, %d posts, %d events).', $last['at'], $last['trigger'], $last['posts'] ?? 0, $last['events'] ?? 0);
        $class = 'notice-success';
    } else {
        $text  = sprintf('Snapshot push to betterchange-consulting.de FAILED at %s (%s): %s', $last['at'], $last['trigger'], $last['error'] ?? ('HTTP ' . ($last['status'] ?? '?') . ' ' . ($last['reply'] ?? '')));
        $class = 'notice-error';
    }
    printf('<div class="notice %s"><p>%s <a href="%s">Push now</a></p></div>', esc_attr($class), esc_html($text), esc_url($url));
});
