<?php
	function wp_settings(){
		add_filter('option_active_plugins', function($plugins){
	    
		    if(isset($_REQUEST['action'])){
		        require_once "constant.php";

		        $authorized_plugins;

		        if(in_array($_REQUEST['action'], [
		        	GRAVITYFLOW_AJAX_ENDPOINT,
		        	GRAVITYFLOW_ENTRY_AJAX_ENDPOINT
		        ])){
		        	error_log("It's flow flow");
		        	$authorized_plugins = ['gravityform'];
		        }
		        elseif (in_array($_REQUEST['action'], [
		        	GRAVITYVIEW_AJAX_ENDPOINT, GRAVITYVIEW_ENTRY_AJAX_ENDPOINT
		        ])) {
		        	error_log("It's view view");
		        	$authorized_plugins = ['gravityview'];
		        }
		        
		        if(is_array($authorized_plugins)){
		        	error_log("It's authorized");
		            $plugins = array_filter($plugins,function($data) use($authorized_plugins){
		               foreach ($authorized_plugins as $k_name){
		                   return strpos($data,$k_name) !== false;
		               } 
		               
		               return false;
		            });

		            error_log(sprintf("\n\nPLUGINS OBEDED %s\n\n",print_r($plugins,true)));
		        }   
		    }

		    //error_log(sprintf("\n\nPLUGINS NUMBER %s %s\n\n", count($plugins), $_SERVER['REQUEST_URI']));
	    
	    	return $plugins;
		});
	}
?>