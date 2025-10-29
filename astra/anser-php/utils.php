<?php 
function flogs($format, ...$args){
	$s = sprintf($format, ...$args);
	error_log($s);
}

?>