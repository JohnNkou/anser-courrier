<?php
	function wp_settings(){
		error_log("WP SETTING CALLED");
		add_filter('option_active_plugins', "plugin_remover");

		function plugin_remover($plugins){
			if(isset($_REQUEST['action'])){
		        require_once "constant.php";
		        $authorized_plugins;

		        if(in_array($_REQUEST['action'], [
		        	GRAVITYFLOW_AJAX_ENDPOINT,
		        	GRAVITYFLOW_ENTRY_AJAX_ENDPOINT
		        ])){
		        	$authorized_plugins = ['gravity'];
		        }
		        elseif (in_array($_REQUEST['action'], [
		        	GRAVITYVIEW_AJAX_ENDPOINT, GRAVITYVIEW_ENTRY_AJAX_ENDPOINT
		        ])) {
		        	$authorized_plugins = ['gravity'];
		        }
		        
		        if(is_array($authorized_plugins)){
		        	$plugins = array_filter($plugins,function($data) use($authorized_plugins){
		               foreach ($authorized_plugins as $k_name){
		                   return strpos($data,$k_name) !== false;
		               } 
		               
		               return false;
		            });

		        	error_log(sprintf("Total plugin loaded after filter %s",count($plugins)));
		        }   
		    }

		    //error_log(sprintf("\n\nPLUGINS NUMBER %s %s\n\n", count($plugins), $_SERVER['REQUEST_URI']));
	    
	    	return $plugins;
		}
	}
?>