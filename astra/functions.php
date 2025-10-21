<?php
/**
 * Astra functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Astra
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Define Constants
 */
define( 'ASTRA_THEME_VERSION', '4.11.5' );
define( 'ASTRA_THEME_SETTINGS', 'astra-settings' );
define( 'ASTRA_THEME_DIR', trailingslashit( get_template_directory() ) );
define( 'ASTRA_THEME_URI', trailingslashit( esc_url( get_template_directory_uri() ) ) );
define( 'ASTRA_THEME_ORG_VERSION', file_exists( ASTRA_THEME_DIR . 'inc/w-org-version.php' ) );

/**
 * Minimum Version requirement of the Astra Pro addon.
 * This constant will be used to display the notice asking user to update the Astra addon to the version defined below.
 */
define( 'ASTRA_EXT_MIN_VER', '4.11.1' );

/**
 * Load in-house compatibility.
 */
if ( ASTRA_THEME_ORG_VERSION ) {
	require_once ASTRA_THEME_DIR . 'inc/w-org-version.php';
}

/**
 * Setup helper functions of Astra.
 */
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-theme-options.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-theme-strings.php';
require_once ASTRA_THEME_DIR . 'inc/core/common-functions.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-icons.php';

define( 'ASTRA_WEBSITE_BASE_URL', 'https://wpastra.com' );

/**
 * ToDo: Deprecate constants in future versions as they are no longer used in the codebase.
 */
define( 'ASTRA_PRO_UPGRADE_URL', ASTRA_THEME_ORG_VERSION ? astra_get_pro_url( '/pricing/', 'free-theme', 'dashboard', 'upgrade' ) : 'https://woocommerce.com/products/astra-pro/' );
define( 'ASTRA_PRO_CUSTOMIZER_UPGRADE_URL', ASTRA_THEME_ORG_VERSION ? astra_get_pro_url( '/pricing/', 'free-theme', 'customizer', 'upgrade' ) : 'https://woocommerce.com/products/astra-pro/' );

/**
 * Update theme
 */
require_once ASTRA_THEME_DIR . 'inc/theme-update/astra-update-functions.php';
require_once ASTRA_THEME_DIR . 'inc/theme-update/class-astra-theme-background-updater.php';

/**
 * Fonts Files
 */
require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-font-families.php';
if ( is_admin() ) {
	require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-fonts-data.php';
}

require_once ASTRA_THEME_DIR . 'inc/lib/webfont/class-astra-webfont-loader.php';
require_once ASTRA_THEME_DIR . 'inc/lib/docs/class-astra-docs-loader.php';
require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-fonts.php';

require_once ASTRA_THEME_DIR . 'inc/dynamic-css/custom-menu-old-header.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/container-layouts.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/astra-icons.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-walker-page.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-enqueue-scripts.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-gutenberg-editor-css.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-wp-editor-css.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/block-editor-compatibility.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/inline-on-mobile.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/content-background.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/dark-mode.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-dynamic-css.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-global-palette.php';

// Enable NPS Survey only if the starter templates version is < 4.3.7 or > 4.4.4 to prevent fatal error.
if ( ! defined( 'ASTRA_SITES_VER' ) || version_compare( ASTRA_SITES_VER, '4.3.7', '<' ) || version_compare( ASTRA_SITES_VER, '4.4.4', '>' ) ) {
	// NPS Survey Integration
	require_once ASTRA_THEME_DIR . 'inc/lib/class-astra-nps-notice.php';
	require_once ASTRA_THEME_DIR . 'inc/lib/class-astra-nps-survey.php';
}

/**
 * Custom template tags for this theme.
 */
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-attr.php';
require_once ASTRA_THEME_DIR . 'inc/template-tags.php';

require_once ASTRA_THEME_DIR . 'inc/widgets.php';
require_once ASTRA_THEME_DIR . 'inc/core/theme-hooks.php';
require_once ASTRA_THEME_DIR . 'inc/admin-functions.php';
require_once ASTRA_THEME_DIR . 'inc/core/sidebar-manager.php';

/**
 * Markup Functions
 */
require_once ASTRA_THEME_DIR . 'inc/markup-extras.php';
require_once ASTRA_THEME_DIR . 'inc/extras.php';
require_once ASTRA_THEME_DIR . 'inc/blog/blog-config.php';
require_once ASTRA_THEME_DIR . 'inc/blog/blog.php';
require_once ASTRA_THEME_DIR . 'inc/blog/single-blog.php';

/**
 * Markup Files
 */
require_once ASTRA_THEME_DIR . 'inc/template-parts.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-loop.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-mobile-header.php';

/**
 * Functions and definitions.
 */
require_once ASTRA_THEME_DIR . 'inc/class-astra-after-setup-theme.php';

// Required files.
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-admin-helper.php';

require_once ASTRA_THEME_DIR . 'inc/schema/class-astra-schema.php';

/* Setup API */
require_once ASTRA_THEME_DIR . 'admin/includes/class-astra-api-init.php';

if ( is_admin() ) {
	/**
	 * Admin Menu Settings
	 */
	require_once ASTRA_THEME_DIR . 'inc/core/class-astra-admin-settings.php';
	require_once ASTRA_THEME_DIR . 'admin/class-astra-admin-loader.php';
	require_once ASTRA_THEME_DIR . 'inc/lib/astra-notices/class-astra-notices.php';
}

/**
 * Metabox additions.
 */
require_once ASTRA_THEME_DIR . 'inc/metabox/class-astra-meta-boxes.php';
require_once ASTRA_THEME_DIR . 'inc/metabox/class-astra-meta-box-operations.php';
require_once ASTRA_THEME_DIR . 'inc/metabox/class-astra-elementor-editor-settings.php';

/**
 * Customizer additions.
 */
require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-customizer.php';

/**
 * Astra Modules.
 */
require_once ASTRA_THEME_DIR . 'inc/modules/posts-structures/class-astra-post-structures.php';
require_once ASTRA_THEME_DIR . 'inc/modules/related-posts/class-astra-related-posts.php';

/**
 * Compatibility
 */
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-gutenberg.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-jetpack.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/woocommerce/class-astra-woocommerce.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/edd/class-astra-edd.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/lifterlms/class-astra-lifterlms.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/learndash/class-astra-learndash.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-beaver-builder.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-bb-ultimate-addon.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-contact-form-7.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-visual-composer.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-site-origin.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-gravity-forms.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-bne-flyout.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-ubermeu.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-divi-builder.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-amp.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-yoast-seo.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/surecart/class-astra-surecart.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-starter-content.php';
require_once ASTRA_THEME_DIR . 'inc/addons/transparent-header/class-astra-ext-transparent-header.php';
require_once ASTRA_THEME_DIR . 'inc/addons/breadcrumbs/class-astra-breadcrumbs.php';
require_once ASTRA_THEME_DIR . 'inc/addons/scroll-to-top/class-astra-scroll-to-top.php';
require_once ASTRA_THEME_DIR . 'inc/addons/heading-colors/class-astra-heading-colors.php';
require_once ASTRA_THEME_DIR . 'inc/builder/class-astra-builder-loader.php';

// Elementor Compatibility requires PHP 5.4 for namespaces.
if ( version_compare( PHP_VERSION, '5.4', '>=' ) ) {
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-elementor.php';
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-elementor-pro.php';
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-web-stories.php';
}

// Beaver Themer compatibility requires PHP 5.3 for anonymous functions.
if ( version_compare( PHP_VERSION, '5.3', '>=' ) ) {
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-beaver-themer.php';
}

require_once ASTRA_THEME_DIR . 'inc/core/markup/class-astra-markup.php';

/**
 * Load deprecated functions
 */
require_once ASTRA_THEME_DIR . 'inc/core/deprecated/deprecated-filters.php';
require_once ASTRA_THEME_DIR . 'inc/core/deprecated/deprecated-hooks.php';
require_once ASTRA_THEME_DIR . 'inc/core/deprecated/deprecated-functions.php';



//ajout d'un filtre pour afficher l'avatar sur le menu
add_filter('wp_nav_menu_items', 'um_011420_avatar_menu', 10, 2);
function um_011420_avatar_menu($items, $args)
{

    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        um_fetch_user($user_id);
        $avatar = "<img src='" . um_get_user_avatar_url() . "' style='width:100px;border-radius:60px;display: block;margin-left: auto;margin-right: auto;width: 40%;' />";
        $items = str_replace('{um_avatar}', $avatar, $items);
    }
    return $items;
}

//Fin ajout d'un filtre pour afficher l'avatar sur le menu





//ajout d'un filtre pour nested class-astra-gravity-forms


add_shortcode('gf_nested_count', function($atts) {
    $atts = shortcode_atts([
        'entry_id' => null,
        'field_id' => null
    ], $atts);

    if (empty($atts['entry_id']) || empty($atts['field_id'])) {
        return 'Paramètres manquants';
    }

    $entry = GFAPI::get_entry($atts['entry_id']);
    if (is_wp_error($entry)) {
        return 'Entrée non trouvée';
    }

    $nested_ids_string = rgar($entry, $atts['field_id']);
    if (empty($nested_ids_string)) {
        return 0;
    }

    $nested_ids = explode(',', $nested_ids_string);

    // Nettoyage : enlever les vides et vérifier les IDs valides
    $nested_ids = array_filter(array_map('trim', $nested_ids), 'is_numeric');

    return count($nested_ids);
});

//Fin de l'ajout d'un filtre pour nested class-astra-gravity-forms
//Fin de l'ajout d'un filtre pour nested class-astra-gravity-forms
//Fin de l'ajout d'un filtre pour nested class-astra-gravity-forms


/* 
    -- **Custom DATA ADDED FOR EXPERIMENTATION-- 
*/

// **Ajout d'un filter pour restreindre le resultat affiché au derniers 4 mois pour gravityflow page inbox


add_filter( 'gravityflow_inbox_search_criteria', 'sh_gravityflow_inbox_search_criteria', 10, 2 );
function sh_gravityflow_inbox_search_criteria( $search_criteria, $args ) {
    $start_date = date( 'Y-m-d', strtotime('-120 days') );
    $end_date = date( 'Y-m-d', time() );
    $search_criteria['start_date'] = $start_date;
    $search_criteria['end_date'] = $end_date;
     
    return $search_criteria;
}

// **Ajout d'un filtre pour restreindre le resultat affiché au derniers 4 mois pour gravityflow page status
add_filter( 'gravityflow_status_filter', function( $args ) {
    $start_date = date( 'Y-m-d', strtotime('-120 days') );
    $end_date = date( 'Y-m-d', time() );
    $args['start_date'] = $start_date;
    $args['end_date'] = $end_date;
    return $args;

}, 10, 1 );

// ** Custom
add_filter("gform_field_filters", function($filters, $form){
    return [
        [
            "key" => "",
            "text" => "Champs",
            "operators" => []
        ],
        [
            "key" => 68,
            "text" => "Entry IDR",
            "preventMultiple"=> false,
            "operators" => ['is', 'isnot', '>', '<', 'contains']
        ],
        [
            "key" => 1,
            "text" => "Numéro courrier",
            "preventMultiple"=> false,
            "operators" => ['is', 'isnot', '>', '<', 'contains']
        ],
        [
            "key" => 2,
            "text" => "Référence du courrier",
            "preventMultiple"=> false,
            "operators" => ['is', 'isnot', '>', '<', 'contains']
        ],
        [
            "key" => 3,
            "text" => "Expéditeur",
            "preventMultiple"=> false,
            "operators" => ['is', 'isnot', '>', '<', 'contains']
        ],
        [
            "key" => 45,
            "text" => "Objet",
            "preventMultiple"=> false,
            "operators" => ['is', 'isnot', '>', '<', 'contains']
        ],
    ];
    
    return $filters;
},10, 2);
// Insertion of the anser-worker serviceWorker
add_action("wp_head", function(){
   ?>
        <script src='/anser_install_worker.js'></script>
   <?php
});

// Custom Ajax Endpoint for experimentation with ajax loading of Gravityflow

$gravityflow_ajax_endpoint = 'load_gravityflow_inbox';
$gravityview_ajax_endpoint = 'load_gravityview';
$gravityview_entry_view_endpoint = 'load_gravityview_entry';

add_action("wp_ajax_$gravityflow_ajax_endpoint", $gravityflow_ajax_endpoint);
add_action("wp_ajax_$gravityview_ajax_endpoint",$gravityview_ajax_endpoint);
add_action("wp_ajax_$gravityview_entry_view_endpoint", $gravityview_entry_view_endpoint);
add_action("wp_enqueue_scripts", function(){
    global $gravityflow_ajax_endpoint, $gravityview_ajax_endpoint, $gravityview_entry_view_endpoint;

    if(is_page(['boite-de-reception-4','mes-courrier-v2','mes-factures-v2'])){
        wp_enqueue_script('tailwindcss','https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4');
        wp_enqueue_style('custom_globe','/css/global.css');
    }

    if (is_page('boite-de-reception-4')) {
        wp_enqueue_script("gravityflow-inbox-ajax", '/js/anser_flow_test.js',[],null,true);
        wp_localize_script('gravityflow-inbox-ajax', 'GravityAjax',[
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('gravityflow_inbox_nonce'),
            'action' => $gravityflow_ajax_endpoint
        ]);   
    }

    if(is_page(['mes-courrier-v2','mes-factures-v2'])){
        wp_enqueue_script('gravityview-ajax','/js/anser_view_test.js',[], null, true);
        wp_localize_script("gravityview-ajax", 'GravityAjax',[
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('gravityview_nonce'),
            'action' => $gravityview_ajax_endpoint,
            'entry' => $gravityview_entry_view_endpoint
        ]);
    }
});

class Extender extends \GV\Shortcode{
    public function get_view($atts){
        return $this->get_view_by_atts($atts);
    }
}

function load_gravityview_entry(){
    if(!isset($_GET['entry_id'])){
        http_response_code(400);
        return wp_send_json_error("No entry_id given");
    }
    if(!isset($_GET['view_id'])){
        http_response_code(400);
        return wp_send_json_error("No view_id given");
    }

    $entries = explode(",", $_GET['entry_id']);
    if(count($entries) > 1){
        return wp_send_json_error("No yet implemented");
        //pass
    }
    else{
        handle_single_entry($entries[0],$_GET['view_id']);
    }
}

function is_empty($objet){
    foreach ($objec as $value) {
        if(is_array($value) && count($value) > 0){
            return false;
        }

        if(is_string($value) && strlen($objet) > 0){
            return false;
        }
        if(is_object($value)){
            if(is_empty($value) == false){
                return false;
            }
        }
    }

    return true;
}

function handle_single_entry($entry_id,$view_id){
    $secret = $_GET['secret'] ?: null;
    $view = get_view($view_id,$secret);
    $form = isset($view->form)? $view->form : GF_Form::by_id($field->form_id);
    $form_id = (isset($view->form))? $view->form->ID : 0;
    $entry = GV\GF_Entry::by_id($entry_id,$form_id);
    $fields = $view->fields->by_position('single_table-columns')->by_visible($view);
    $results = [];

    foreach ($fields->all() as $field) {
        $label = $field->label;
        $value = $field->get_value($view,$form,$entry,null);

        error_log("labe $label, value :".print_r($value,true));

        if(is_array($value)){
            if(count($value) == 0)
                continue;
            elseif(count(array_filter($value,function($v){
                if(is_string($v) && strlen($v) > 0){
                    return true;
                }

                if(is_array($v) && count($v) > 0){
                    return true;
                }

                return false;
            })) == 0){
                continue;
            }
        }
        else if(is_object($value) && is_empty($value)){
            continue;
        }
        else{
            if(strlen($value) == 0){
                continue;
            }

            if($value[0] == "["){
                $value = json_decode($value);

                if(is_array($value) && count($value) == 0){
                    continue;
                }
                else if(is_object($value) && is_empty($value)){
                    continue;
                }
            }
        }

        $results[$label] = $value;
    }

    return wp_send_json_success(["entry"=> $results]);
}

function get_view($id,$secret){
    $short_code = new Extender();
    $attrs = [
        "id"=> $id,
        "view_id" => $id
    ];

    if($secret){
        $attrs["secret"] = $secret;
    }

    return $short_code->get_view($attrs);
}


function load_gravityview(){
    if(!isset($_GET['id'])){
        http_response_code(400);
        return wp_send_json_error("No id given");
    }
    $request = gravityview()->request;

    $request = gravityview()->request;
    $limit = isset($_GET['limit'])? (int)$_GET['limit'] : 25;
    $offset = isset($_GET['offset'])? (int)$_GET['offset'] : 0;
    $id = $_GET['id'];
    $secret = $_GET['secret'] ?: Null;
    $view = get_view($id,$secret);
    $view->settings->update([
        "page_size"=> $limit,
        "offset"=> $offset
    ]);
    $entries = $view->get_entries($request);
    $fields = $view->fields->by_position( 'directory_table-columns' );
    $fields_array = $fields->by_visible($view)->all();
    $results = [];

    foreach ($entries->all() as $entry) {
        $an = [];
        if($entry->is_multi()){ error_log("MULTI ENTRY ".json_encode($entry));
            foreach ($fields_array as $field) {
                $_entry = $entry->as_entry()['_multi'][$field->form_id];
                $an[ $field->custom_label ?: $field->label] = $_entry[$field->ID];
            }
        }
        else{
            foreach ($fields_array as $field) {
                $an[$field->custom_label ?: $field->label] = $entry[$field->ID];
            }
        }
        $an['id'] = $entry->ID;
        array_push($results, $an);
    }

    wp_send_json_success(["entries"=>$results, "total"=> $entries->total()]);
}



function load_gravityflow_inbox(){
    // The global $post must be set in order for the gravityflow class to pass the request and not return an empty string
    check_ajax_referer('gravityflow_inbox_nonce', 'security');
    $form_ids = "94,22,17,14,75,16,2,3,5,7,8,12,11,21,4,64,74,84,96";
    $current_user = wp_get_current_user();
    $offset = isset($_REQUEST['offset'])? $_REQUEST['offset']: 0;
    $limit = isset($_REQUEST['limit'])? $_REQUEST['limit']: 10;
    $required_fields = ["form_id","workflow_step","created_by","id","date_created"];
    $required_form_fields = ["objet","éxpediteur","numéro","référence"];
    $total = 0;
    
    if(isset($_REQUEST['term'])){
        $results = search_reception($_REQUEST['term'],$offset,$limit);
        $entries = $results['entries'];
        $total = $results['total'];
    }
    else{
        $search_criteria = build_search_criteria();
        $entries = Gravity_Flow_API::get_inbox_entries( ["form_id"=>$form_ids, "paging"=> ["offset"=>$offset, "page_size"=> $page_size]],$total);
    }
    
    $fields_values = [];
    
    foreach (explode(",",$form_ids) as $form_id){
        $fields_values[$form_id] = [];
        $form = GFAPI::get_form($form_id);
        $id_founds = [];
        
        foreach ($form['fields'] as $field){
            $found_field = array_filter($required_form_fields,function($value) use ($field, &$id_founds){
                $label = strtolower($field->label);
                
                if(strpos($label,$value) !== false){
                    if(array_key_exists($value,$id_founds) === false){
                        $id_founds[$value] = $field->id;
                        return true;
                    }
                }
                
                return false;
            });
            
            if(count($found_field) > 0){
                $field_value = array_values($found_field)[0];
                array_push($required_fields,$field->id);
                $fields_values[$form_id][$field_value] = $field->id;
            }
        }
    }
    
    $filtered_entries = array_map(function($entry) use ($required_fields){
        $display_name = get_display_name($entry['created_by']);
        $step_name = get_current_step_name($entry['form_id'], $entry['workflow_step']);
        
        if($display_name){
            $entry['created_by'] = $display_name;
        }
        if($step_name){
            $entry['workflow_step'] = $step_name;
        }
        
       return array_intersect_key($entry, array_flip($required_fields)); 
    },$entries);
    
    wp_send_json_success(["entries"=>$filtered_entries, "field_values"=> $fields_values, "total"=> $total]);
}

function get_display_name($user_id){
    $user_info = get_userdata($user_id);
    
    if($user_info){
        return $user_info->display_name;
    }
    
    return null;
}

function get_current_step_name($form_id,$step_id){
    $api = new Gravity_Flow_API($form_id);
    $current_step = $api->get_step($step_id);
    
    if($current_step){
        return $current_step->get_name();
    }
    
    return null;
}

function build_search_criteria(){
    $search_criteria = [];
    $field_filters = [];
    $status = "active";
    $start_date = date( 'Y-m-d', strtotime('-120 days') );
    $end_date = date( 'Y-m-d', time() );
    $current_user = wp_get_current_user();
    
    array_push($field_filters, ["key"=> "workflow_user_id_".$current_user->ID, "value"=> "pending"]);
    
    foreach ($current_user->roles as $role){
        array_push($field_filters,["key"=> "workflow_role_".$role, "value"=> "pending"]);
    }
    
    $field_filters["mode"] = "any";
    $search_criteria['field_filters'] = $field_filters;
    $search_criteria['start_date'] = $start_date;
    $search_criteria['end_date'] = $end_date;
    $search_criteria['status'] = $status;
    
    return $search_criteria;
}

function set_search_criteria($term,$fields){
    add_filter("gravityflow_inbox_search_criteria",function ($search_criteria,$args) use ($term,$fields) {
        $field_filters = [];
        foreach ($fields as $field){
            array_push($field_filters,["key"=> $field, "operator"=> "is", "value"=> $term]);   
        }
        
        $search_criteria['mode'] = "any";
        $search_criteria['field_filters'] = $field_filters;
        
        return $search_criteria;
    },10,2);
    
    $search_criteria = build_search_criteria();
    $field_filters = [];
    
    foreach ($fields as $field){
        array_push($field_filters,["key"=> $field, "operator"=> "is", "value"=> $term]);
    }
    $field_filters['mode'] = "any";
    $search_criteria['field_filters'] = $field_filters;
    
    return $search_criteria;
}

function search_reception($term, $offset=0,$limit=15){
	global $wpdb;
    
    $current_user = wp_get_current_user();
    
    if($current_user){
        $user_id = $current_user->ID;
        $entry_meta_table = GFFormsModel::get_entry_meta_table_name();
    	$sql = "SELECT DISTINCT entry_id as id FROM $entry_meta_table as t1 WHERE t1.meta_value = %s AND (SELECT id FROM $entry_meta_table as t2 WHERE entry_id = t1.entry_id AND meta_key = %s LIMIT 1) LIMIT %d,%d";
    	$payloads = [$term,"workflow_user_id_$user_id",$offset,$limit];
    	$entries_results = $wpdb->get_results($wpdb->prepare($sql,$payloads), ARRAY_N);
        $query_total = (int)$wpdb->get_var('SELECT FOUND_ROWS()');
    	$q = new GF_Query();
    
    	return ["entries"=>$q->get_entries($entries_results), "total"=> $query_total];
    }
    error_log("search_reception called without a valid user");
    
    return ["entries"=>[], "total"=>0];
}

?>