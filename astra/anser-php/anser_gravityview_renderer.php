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
 	
 	public function render($view,$request){
 		$entries = $view->get_entries($request);
 		$this->view = $view;
 		$this->entries = $entries;

 		$this->register_scripts();
 		$this->register_styles();

    	ob_start();

    	$this->build($view,$entries);

    	return ob_get_clean();
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
    					if(!$seen){
    						flogs("DEBUGGIN FIELD ".print_r($field));
    						$seen = true;
    					}
    					$label = $field->custom_label ?: $field->label;
    					$class = ($key == 0 || $key == ($length-1))? "rounded": "";
    					echo "<th class='$class'>$label</th>";
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
 			var _Page = { view_id:<?php echo $id ?>, filters:<?php echo $filters ?>, secret:"<?php echo $secret ?>" };
 			var _localized_name = "<? echo JS_AJAX_NAME ?>";

 			if(!_Page.filters || !_Page.filters.length){
 				alert("Aucun filter definits dans gravityview");
 			}
 		</script>
 	<?php	
 	}

 	protected function register_styles(){
 		wp_enqueue_style('custom_global','/css/global.css');
 		wp_enqueue_style('custom_modal','/css/modal.css');
 	}

 	protected function register_scripts(){
 		wp_enqueue_script('tailwindcss','https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4');
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