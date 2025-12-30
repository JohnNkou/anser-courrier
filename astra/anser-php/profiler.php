<?php
	/**
	 * This class will be used for profiling
	 */
	class Profiler
	{
		private $names = [];
		private $prefix;

		function __construct($prefix = ""){
			$this->prefix = $prefix;
		}
		
		public function time($keyName)
		{
			$this->names[$keyName] = hrtime(true);
		}

		public function timeEnd($keyName){
			$timeThen = $this->names[$keyName] ?? null;
			if ($timeThen) {
				$timeElapsed = (hrtime(true) - $timeThen) / 1e+6;
				error_log(sprintf("\n\n%s It took %sms to run %s\n\n", $this->prefix, $timeElapsed, $keyName ));

				return;
			}

			error_log("No timeStart found in names for keyName ".$keyName);

			return null;
		}
	}

?>