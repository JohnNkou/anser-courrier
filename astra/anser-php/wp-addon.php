<?php
	function wp_settings(){
		$displayed = false;
		add_filter('option_active_plugins', function($plugins) use(&$displayed){
			if(isset($_REQUEST['action'])){
				$method = $_SERVER['REQUEST_METHOD'];
				require_once "constant.php";
		        $authorized_plugins;

		        if(in_array($_REQUEST['action'], [
		        	GRAVITYFLOW_AJAX_ENDPOINT,
		        	GRAVITYFLOW_ENTRY_AJAX_ENDPOINT
		        ])){
		        	$authorized_plugins = ['gravityforms.php','gravityflow.php','gravityview.php','gravityformswebhooks','gravityformsadvancedpostcreation','spellbook'];

		        	if($method == 'POST'){
		        		array_push($authorized_plugins, 'gravityflow');
		        	}
		        }
		        elseif (in_array($_REQUEST['action'], [
		        	GRAVITYVIEW_AJAX_ENDPOINT, GRAVITYVIEW_ENTRY_AJAX_ENDPOINT
		        ])) {
		        	$authorized_plugins = ['gravityview.php','gravityforms.php','gravityview-diy','gravityview-entry-revisions','gravityview-advanced-filter'];
		        }
		        
		        if(isset($authorized_plugins) && is_array($authorized_plugins)){
		        	$plugins = array_filter($plugins,function($data) use($authorized_plugins){
		               foreach ($authorized_plugins as $k_name){
		                   	if(strpos($data,$k_name) !== false){
		                   		return true;
		                   	}
		               } 
		               
		               return false;
		            });

		            if(!$displayed){
		            	error_log(sprintf("Total plugin loaded after custom filter %s",count($plugins)));
		            	error_log(sprintf("Plugin after filter %s",print_r($plugins,true)));
		            	$displayed = true;
		            }
		        }
		    }
		    /*elseif (strpos($_SERVER['REQUEST_URI'], 'reception-dg')) {
		    	error_log(sprintf("TOTAL PLUGINS LOADED ARE %s", print_r($plugins,true)));
		    }*/

	    
	    	return $plugins;
		});
	}
?>