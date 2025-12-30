<?php
	function wp_settings(){
		add_filter('option_active_plugins', function($plugins){
	    
		    if(isset($_REQUEST['action'])){
		        require_once "constant.php";
		        
		        if(in_array($_REQUEST['action'], [
		            GRAVITYVIEW_AJAX_ENDPOINT, GRAVITYVIEW_ENTRY_AJAX_ENDPOINT, GRAVITYFLOW_AJAX_ENDPOINT
		            ])){
		            $authorized_plugins = ['gravity'];
		            
		            $plugins = array_filter($plugins,function($data) use($authorized_plugins){
		               foreach ($authorized_plugins as $k_name){
		                   return strpos($data,$k_name) !== false;
		               } 
		               
		               return false;
		            });
		        }   
		    }
	    
	    	//error_log(sprintf("\n\nPLUGINS NUMBER %s %s\n\n", count($plugins), $_SERVER['REQUEST_URI']));
	    
	    	return $plugins;
		});
	}
?>