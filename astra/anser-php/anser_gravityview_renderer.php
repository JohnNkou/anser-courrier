<?php 
namespace ANSER\GV;

use GV\Renderer;

/**
  * 
  */

class View_Renderer extends Renderer
 {
 	private $view;
 	private $entries;
 	private $filters = [
 		["value"=>"",			"label"=>"tous"],
 		["value"=>"pending", 	"label"=>"en attente"],
 		["value"=>"approved",	"label"=>"apprové"],
 		["value"=>"rejected", 	"label"=>"rejeté"],
 		["value"=>"complete",	"label"=>"terminé"]
 	];

 	public $gravityview_ajax_endpoint = 'load_gravityview';
 	public $gravityview_entry_view_endpoint = 'load_gravityview_entry';
    public $search_widgets;
 	
 	public function render($view,$request){
 		$entries = $view->get_entries($request);
 		$this->view = $view;
 		$this->entries = $entries;
        $this->search_widgets = $this->build_search_widget($view->widgets->by_position("header_top*")->all()[0]);

 		$this->register_scripts();

    	ob_start();

    	$this->build($view,$entries);

    	return ob_get_clean();
 	}

    private function build_search_widget($widget,$content = '', $context = ''){
        $widget_args = $widget->configuration->all();
        $view = $this->view;

        // get configured search fields
        $search_fields = ! empty( $widget_args['search_fields'] ) ? json_decode( $widget_args['search_fields'], true ) : '';
        if ( empty( $search_fields ) || ! is_array( $search_fields ) ) {
            gravityview()->log->debug( 'No search fields configured for widget:', array( 'data' => $widget_args ) );
            return;
        }
        // prepare fields
        foreach ( $search_fields as $k => $field ) {
            $updated_field = $field;

            flogs("WIDGET FIELD %s",print_r($field,true));

            $updated_field = $this->get_search_filter_details( $updated_field, $context, $widget_args );
            
            switch ( $field['field'] ) {

                case 'search_all':
                    $updated_field['key']   = 'search_all';
                    $updated_field['input'] = 'search_all';
                    $updated_field['value'] = $this->rgget_or_rgpost( 'gv_search' );
                    break;

                case 'entry_date':
                    $updated_field['key']   = 'entry_date';
                    $updated_field['input'] = 'entry_date';
                    $updated_field['value'] = array(
                        'start' => $this->rgget_or_rgpost( 'gv_start' ),
                        'end'   => $this->rgget_or_rgpost( 'gv_end' ),
                    );
                    break;

                case 'entry_id':
                    $updated_field['key']   = 'entry_id';
                    $updated_field['input'] = 'entry_id';
                    $updated_field['value'] = $this->rgget_or_rgpost( 'gv_id' );
                    break;

                case 'created_by':
                    $updated_field['key']   = 'created_by';
                    $updated_field['name']  = 'gv_by';
                    $updated_field['value'] = $this->rgget_or_rgpost( 'gv_by' );
                    break;

                case 'is_approved':
                    $updated_field['key']     = 'is_approved';
                    $updated_field['value']   = $this->rgget_or_rgpost( 'filter_is_approved' );
                    $updated_field['choices'] = self::get_is_approved_choices();
                    break;

                case 'is_read':
                    $updated_field['key']     = 'is_read';
                    $updated_field['value']   = $this->rgget_or_rgpost( 'filter_is_read' );
                    $updated_field['choices'] = array(
                        array(
                            'text'  => __( 'Unread', 'gk-gravityview' ),
                            'value' => 0,
                        ),
                        array(
                            'text'  => __( 'Read', 'gk-gravityview' ),
                            'value' => 1,
                        ),
                    );
                    break;
            }

            $search_fields[ $k ] = $updated_field;
        }

        return [
            "search_fields"=> apply_filters( 'gravityview_widget_search_filters', $search_fields, $this, $widget_args, $context ),
            "search_mode"=> ! empty( $widget_args['search_mode'] ) ? $widget_args['search_mode'] : 'any'
        ];
    }

    private function get_search_filter_details( $field, $context, $widget_args ) {

        $form = $this->view->form;

        // for advanced field ids (eg, first name / last name )
        $name = 'filter_' . str_replace( '.', '_', $field['field'] );

        // get searched value from $_GET/$_POST (string or array)
        $value = "";

        // get form field details
        $form_field = gravityview_get_field( $form, $field['field'] );

        $form_field_type = \GV\Utils::get( $form_field, 'type' );

        $filter = array(
            'key'   => \GV\Utils::get( $field, 'field' ),
            'name'  => $name,
            'label' => self::get_field_label( $field, $form_field ),
            'input' => \GV\Utils::get( $field, 'input' ),
            'value' => $value,
            'type'  => $form_field_type,
        );

        // collect choices
        if ( 'post_category' === $form_field_type && ! empty( $form_field['displayAllCategories'] ) && empty( $form_field['choices'] ) ) {
            $filter['choices'] = gravityview_get_terms_choices();
        } elseif ( ! empty( $form_field['choices'] ) ) {
            $filter['choices'] = $form_field['choices'];
        }

        if ( 'date_range' === $field['input'] && empty( $value ) ) {
            $filter['value'] = array(
                'start' => '',
                'end'   => '',
            );
        }

        if ( 'number_range' === $field['input'] && empty( $value ) ) {
            $filter['value'] = array(
                'min' => '',
                'max' => '',
            );
        }

        if ( 'created_by' === $field['field'] ) {
            $filter['choices'] = self::get_created_by_choices( ( isset( $context->view ) ? $context->view : null ) );
            $filter['type']    = 'created_by';
        }

        if( 'payment_status' === $field['field'] ) {
            $filter['type']    = 'entry_meta';
            $filter['choices'] = GFCommon::get_entry_payment_statuses_as_choices();
        }

        if ( 'payment_status' === $field['field'] ) {
            $filter['type']    = 'entry_meta';
            $filter['choices'] = GFCommon::get_entry_payment_statuses_as_choices();
        }

        /**
         * Filter the output filter details for the Search widget.
         *
         * @since 2.5
         * @param array $filter The filter details
         * @param array $field The search field configuration
         * @param \GV\Context The context
         */
        return apply_filters( 'gravityview/search/filter_details', $filter, $field, $context );
    }

 	protected function build(){
 		wp_enqueue_script('tailwindcss','https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4');
        wp_enqueue_style('custom_globe','/css/global.css');
    	?>
    	<div id="my-content" class="shadow-md mt-4 p-2 align-middle  position-relative">
    		<?php
    			$this->header();
    			$this->filter();
    			$this->table();
    			$this->loader();
    			$this->entry_modal();
    			$this->init_js();
    		?>
    	</div>

    	<?php
 	}

 	protected function header(){
 		$title = $this->view->get_post()->post_title;
 		?>
 		<header>
    		<div>
    			<h1 class='inline'><?php echo $title ?></h1>
    		</div>
    		<form class='flex justify-end items-center gap-1 search_block'>
    			<input type="text" class="" name="s" placeholder=""Recherche><button type='submit'>Rechercher</button>
    		</form>
    	</header>
 		<?php
 	}

 	protected function filter(){
 		?>
 		<div class='flex gap-0 text-sm status_filter'>
 		<?php
 			foreach ($this->filters as $key => $filter) {
 				$class = $key == 0 ? "active":"";
 				$value = $filter['value'];
 				$label = $filter['label'];

 				echo "<a class='$class' data-value='$value'>$label</a>";
 			}
 		?>
 		</div>
 		<?php
 	}

 	protected function table(){
 		$view = $this->view;
 		$fields = $view->fields->by_position( 'directory_table-columns' );
    	$fields_array = $fields->by_visible($view)->all();

    	?>
    	<div class='mt-4 main-table'>
    		<table class='border-collapse border border-black text-left'>
    			<thead>
    				<tr>
    				<?php
    				$length = count($fields_array);
    				$seen = false;

    				foreach ($fields_array as $key=> $field) {
    					$label = $field->custom_label ?: $field->label;
    					echo "<th >$label</th>";
    				}
    				?>
    				</tr>
    			</thead>
    			<tbody>
    				
    			</tbody>
    		</table>
    		<div class="flex justify-center gap-2 navigation">
                <button class="p-0 bg-danger hidden previousPage">&lt;</button>
                <button class="p-0 hidden nextPage">&gt;</button>
            </div>
    	</div>
    	<?php
 	}

 	protected function loader(){ ?>
 		<div id="loader" class="flex hidden">
            <h1 class="animate-ping text"></h1>
        </div>
 	<?php }

 	protected function entry_modal(){ ?>
 		<div class="modal hidden">
            <div class="containers">
                <header>
                    <h1 class="text-center">Entrée <span class="courrier_number"></span></h1>
                    <p class="close absolute">X</p>
                </header>
                <div class="classMan"></div>
            </div>
		</div>
		<div id='pdfviewer' class='hidden'>
            <iframe src=''></iframe>
            <button class='close'>Fermer</button>
        </div>
 	<?php }

 	protected function init_js(){
 		$view = $this->view;
 		$filters = $this->view->settings->get('filters');
 		$secret = $this->view->settings->get('secret');
 		$id = $view->ID;
 		if(empty($filters)){
 			$filters = json_encode(array());
 		}

 	?>
 		<script>
 			var _Page = { view_id:<?php echo $id ?>, filters:<?php echo json_encode($filters) ?>, secret:"<?php echo $secret ?>" };
 			var _localized_name = "<? echo JS_AJAX_NAME ?>";

 			if(!_Page.filters || !_Page.filters.length){
 				alert("Aucun filter definits dans gravityview");
 			}
 		</script>
 	<?php	
 	}

 	protected function register_scripts(){
 		wp_enqueue_script('gravityview-ajax','/js/anser_view_test.js',[], null, true);
        wp_localize_script('gravityview-ajax',JS_AJAX_NAME, [
        	'ajax_url' => admin_url('admin-ajax.php'),
        	'view_action'=> GRAVITYVIEW_AJAX_ENDPOINT,
        	'view_nonce' => wp_create_nonce(GRAVITYVIEW_NONCE_NAME),
        	'view_entry_action'=> GRAVITYVIEW_ENTRY_AJAX_ENDPOINT,
        	'view_entry_nonce'=> GRAVITYVIEW_ENTRY_NONCE_NAME
        ]);
 	}
} 


?>