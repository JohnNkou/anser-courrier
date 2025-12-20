<?php
require_once ABSPATH . "/wp-content/plugins/gravityview/future/includes/class-gv-shortcode.php";
require_once ABSPATH . "vendor/autoload.php";

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function handle_upload_entry($permission_granted,$entry,$form,$current_step){
    $uploaded_files = rgpost('gform_uploaded_files');

    if($uploaded_files){
        $uploaded_files = json_decode($uploaded_files);
        flogs("UPLOADED_FILES IS %s", print_r($uploaded_files,true));

        foreach ($uploaded_files as $key => $_) {
            $key = str_replace("input_", "", $key);
            $value = $entry[$key];

            if(is_string($value)){
                if(strlen($value)){
                    $value = json_decode($value);
                }
            }

            if(is_array($value)){
                $dir = wp_upload_dir();
                $_value = array_map(function($v) use($dir,$key,$entry){
                    $v = wp_unslash($v);

                    if(strpos($v, S3_UPLOAD_DIR_URL) == false){
                        flogs("UPLOADING FILE %s TO AWS S3",$v);
                        $pathname = str_replace($dir['baseurl'],"",$v);
                        $file_path = sprintf("%s%s",$dir['basedir'],$pathname);


                        flogs("CONSTRUCTED PATHNAME IS %s",$file_path);

                        if(file_exists($file_path)){
                            $s3Client = build_s3_client();
                            $s_key = sprintf("%s%s",S3_MEDIA_GRAVITY_KEY,$pathname);

                            flogs("UPLOADING WITH KEY %s",$s_key);
                            try{
                                $s3Client->putObject([
                                    "Bucket" => ADVMO_AWS_BUCKET,
                                    "Key" => $s_key,
                                    "SourceFile"=> $file_path
                                ]);

                                flogs("SUCCESSFULLY UPDATE FILE %s TO S3 WITH KEY %s",$file_path,$s_key);

                                $new_value = wp_slash(sprintf("%s%s", S3_UPLOAD_DIR_URL, $pathname));

                                return $new_value;
                            }
                            catch(AwsException $e){
                                flogs("AWSException %s",print_r($e,true));
                            }
                            catch(Exception $e){
                                flogs("Exception %s",print_r($e,true));
                            }
                            catch(Error $e){
                                flogs("Error %s",print_r($e,true));
                            }
                        }
                        else{
                            flogs("FILE %s COULDN'T NOT BE FOUND",$file_path);
                        }
                    }
                    else{
                        flogs("VALUE %s already is a s3 object",$v);
                    }

                    return $v;
                },$value);

                flogs('UPADING VALUE %s TO _VALUE %s', print_r($value,true), print_r($_value,true));
                flogs("entry id %s, key: %s, form_id %s",$entry['id'],$key,$form['id']);

                gform_update_meta($entry['id'],$key,json_encode($_value),$form['id']);
            }
            else{
                flogs("value is not an array %s",$value);
            }
        }
    }

    return $permission_granted;
}

function build_s3_client(){
    return new S3Client([
        "version" => "latest",
        "region" => "us-east-1",
        "credentials" => [
            "key"       => ADVMO_AWS_KEY,
            "secret"    => ADVMO_AWS_SECRET
        ]
    ]);
}

function remove_entry_file($entry,$form){
    $fields = $form['fields'];
    $upload_files = [];

    foreach ($fields as $field) {
        if($field->type == 'fileupload'){
            $value = $entry[$field->id];
            if(strlen($value) > 0){
                if(is_string($value)){
                    $value = json_decode(wp_unslash($value)) ?? $value;
                }

                array_walk($value, function($src){
                    if(strpos($src, S3_BUCKET_URL) !== false){
                        $basedir = wp_upload_dir()['basedir'];
                        $pathname = str_replace(S3_UPLOAD_DIR_URL, '', $src);
                        $file_path = sprintf("%s/%s",$basedir,$pathname);
                        flogs("S3_UPLOAD_DIR_URL %s", S3_UPLOAD_DIR_URL);
                        flogs("PATH NAME IS %s",$pathname);

                        flogs("Checking for file name existing %s",$file_path);

                        if (file_exists($file_path)) {
                            flogs("File existing. Removing");
                            unlink($file_path);
                        }
                        else{
                            flogs("File %s don't exist", $file_path);
                        }
                    }
                });
            }
        }
    }
}

function process_download_file($permission_granted, $form_id, $field_id){

    flogs("PROCESS DOWNLOAD FILE HANDLING");

    $file = $_GET['gf-download'];

    flogs("FILE IS %s",$file);

    if($permission_granted){
        flogs("DOWNLOAD FILE FROM S3 %s",S3_UPLOAD_DIR_URL);
        $upload_key = sprintf("%s/gravity_forms/%s-%s/%s", S3_MEDIA_GRAVITY_KEY,$form_id, wp_hash($form_id),$file);

        $s3Client = build_s3_client();

        flogs('UPLOAD KEY IS %s',$upload_key);
        flogs('S3 BUCKET %s', ADVMO_AWS_BUCKET);
        flogs("typeof s3Client %s", gettype($s3Client));
        try{
            $result = $s3Client->getObject([
                "Bucket" => ADVMO_AWS_BUCKET,
                "Key" => $upload_key
            ]);
            

            flogs("GOT THE RESULT");

            $contentType = $result['ContentType'] ?? 'application/octet-stream';
            $filename = basename($file);

            header("Content-Description: File Transfer");
            header("Content-Type: ". $contentType);
            header("Content-Disposition: attachment; filename='" . $filename. "'");
            header("Content-Transfer-Encoding: binary");

            if(isset($result['ContentLength'])){
                header('Content-Length: '.$result['ContentLength']);
            }

            if(ob_get_contents()){
                ob_end_clean();
            }

            $stream = $result['Body'];

            $stream->rewind();

            while (!$stream->eof()){
                echo $stream->read(1048576);
                flush();
            }

            exit;
        }
        catch(AwsException $e){
            http_response_code(404);
            flogs("AWSException Error %s",print_r($e,true));
        }
        catch(\Exception $e){
            http_response_code(500);
            flogs("Exception Error %s",print_r($e,true));
        }
        catch(\Error $e){
            http_response_code(500);
            flogs("Error error %s",print_r($e,true));
        }
    }
    
    return $permission_granted;
}

function handle_gravity_form_submission($display_value, $field, $entry, $form ){
    if($field->type == 'fileupload'){
        $dir = wp_upload_dir();
        if(strpos($display_value, $dir['baseurl']) !== false){
            $new_value = str_replace($dir['baseurl'], S3_BUCKET_URL, $display_value);
        }
    }

    return $display_value;
}

function flogs($format, ...$args){
	$s = sprintf($format, ...$args);
	error_log($s);
}

class Extender extends \GV\Shortcode{
    public function get_view($atts){
        return $this->get_view_by_atts($atts);
    }
}

function load_gravityview_entry(){
    $entry_id = $_GET['entry_id'] ?: null;
    $view_id = $_GET['view_id'] ?: null;

    if($entry_id === null){
        http_response_code(400);
        return wp_send_json_error("No entry_id given");
    }
    if($view_id === null){
        http_response_code(400);
        return wp_send_json_error("No view_id given");
    }

    $entries = explode(",", $entry_id);
    if(count($entries) > 1){
        handle_multi_entry($entries,$view_id);
    }
    else{
        handle_single_entry($entries[0],$view_id);
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

function handle_multi_entry($entries,$view_id){
    $view = get_view($view_id);
    $form = isset($view->form)? $view->form: GF_Form::by_id($field->form_id);
    $form_id = (isset($view->form))? $view->form->ID:0;
    $entries = array_map(function($entry_id) use ($form_id){
        return GV\GF_Entry::by_id($entry_id,$form_id);
    }, $entries);
    $entry = GV\Multi_Entry::from_entries($entries);
    $results = build_entries_array($view,$entry);

    return wp_send_json_success(["entry"=> $results]);
}

function build_entries_array($view,$entry){
    $fields = $view->fields->by_position('single_table-columns')->by_visible($view);
    $results = [];

    foreach ($fields->all() as $field) {
        $label = $field->custom_label ?: $field->label;

        if($entry->is_multi()){
            $value = $entry->as_entry()['_multi'][$field->form_id][$field->ID];
        }
        else{
            $value = $entry->as_entry()[$field->ID];
        }

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

    return $results;
}

function handle_single_entry($entry_id,$view_id){
    $secret = $_GET['secret'] ?: null;
    $view = get_view($view_id);
    $form = isset($view->form)? $view->form : GF_Form::by_id($field->form_id);
    $form_id = (isset($view->form))? $view->form->ID : 0;
    $entry = GV\GF_Entry::by_id($entry_id,$form_id);
    $results = build_entries_array($view,$entry);

    return wp_send_json_success(["entry"=> $results]);
}

function get_view($id){
    $short_code = new Extender();
    $attrs = [
        "id"=> $id,
        "view_id" => $id
    ];

    if(isset($_GET['secret'])){
        $attrs["secret"] = $_GET['secret'];
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
    $view = get_view($id);

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
        $id;
        if($entry->is_multi()){
            $entry_ids = [];
            foreach ($fields_array as $field) {
                $_entry = $entry->as_entry()['_multi'][$field->form_id];
                $an[ $field->custom_label ?: $field->label] = $_entry[$field->ID];
                array_push($entry_ids,$_entry['id']);
            }

            $id = join(",", array_unique($entry_ids));
        }
        else{
            foreach ($fields_array as $field) {
                $an[$field->custom_label ?: $field->label] = $entry[$field->ID];
            }
            $id = $entry->ID;
        }
        $an['id'] = $id;
        array_push($results, $an);
    }

    wp_send_json_success(["entries"=>$results, "total"=> $entries->total()]);
}


function load_gravityflow_inbox_entry(){
    $entry_id = $_GET['entry_id'] ?: null;
    $entry = GFAPI::get_entry($entry_id);
    $passed_id = rgget("id");
    $form_id = $entry['form_id'];

    if(!$entry_id || !$passed_id){
        return wp_send_json_error("Should provide an entry_id and a passed_id");
    }

    if(!empty($passed_id) && $form_id != $passed_id){
        return wp_send_json_error("Entry form id with passed id differents");
    }

    if(is_wp_error($entry)){
        error_log("Entry is wp_error ".print_r($entry));
        return wp_send_json_error(["message"=>$entry]);
    }

    $form = GFAPI::get_form($form_id);
    $GFFlow = Gravity_Flow::get_instance();
    $current_step = $GFFlow->get_current_step($form,$entry);

    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        $results = build_inbox_results($form,$entry,$current_step);
        $workflow_info = get_workflow_info($current_step, $form, $entry);
        $actions_data = handle_gravityflow_action($current_step);

        array_push($results,$workflow_info);
        array_push($results, $actions_data);

        return wp_send_json_success(["inbox"=> $results, "form_title"=> $form['title']]);   
    }
    else{
        if(isset($_POST['_action'])){
            $_REQUEST['action'] = $_POST['_action'];
            $_POST['action'] = $_POST['_action'];
        }
        $process_entry_detail = apply_filters( 'gravityflow_inbox_entry_detail_pre_process', true, $form, $entry );
        error_log("Processing entry detail ".print_r($process_entry_detail,true));

        if ( ! $process_entry_detail || is_wp_error( $process_entry_detail ) ) {
            error_log("Process entry detail is falsy or an instance of wp_error");
            return wp_send_json_error(["message"=>"Les entrés ne peuvent pas etre traité"]);
        }

        $step = $current_step;

        if($step){error_log("Step is defined so cool");
            $feedback = $step->process_status_update($form,$entry);

            if($feedback){
                error_log("Received feedback after calling ".substr(print_r($feedback,true), 0,200));
            }

            if($feedback && !is_wp_error($feedback)){
                error_log("Goind for to process_workflow");
                $GFFlow->process_workflow($form,$entry_id);
            }
        }
        else{
            error_log("OUPS not step");
        }

        if(is_wp_error($feedback)){
            if(isset($feedback->error_data['validation_result'])){
                $invalid_field = array_filter($feedback->error_data['validation_result']['form']['fields'],function($field){
                    return $field->failed_validation;
                });
                $invalid_field = array_map(function($field){
                    return [
                        "id"=> $field->id,
                        "message"=> $field->validation_message
                    ];
                },$invalid_field);
                $invalid_field = array_values($invalid_field);

                return wp_send_json_error(["invalid_field"=> $invalid_field]);
            }
            return wp_send_json_error(["message"=> $feedback]);
        } 
        elseif($feedback){
            error_log("It's passed ".print_r($feedback,true));
            $feedback = GFCommon::replace_variables($feedback, $form, $entry, false, true, true, 'html');

            if(substr($feedback, 0,3) !== '<p>'){
                $feedback = sprintf('<p>%s</p>',$feedback);
            }

            return wp_send_json_success(["message"=> $feedback]);
        }
        else{
            return wp_send_json_error(["message"=>"Nothing was done"]);
        }
    }
}

function handle_gravityflow_action($step){
    $action = null;
    $can_update = false;


    foreach ($step->get_assignees() as $assignee) {
        if($assignee->is_current_user()){
            $can_update = true;
            break;
        }
    }

    if($can_update){
        $step_id = $step->get_id();

        if($step instanceof Gravity_Flow_Step_Approval){
            $action = [
                [
                    "type"=>"hidden",
                    "name"=>"_wpnonce",
                    "value"=> wp_create_nonce("gravityflow_approvals_".$step_id) 
                ],
                [
                    "type"=>"hidden",
                    "id"=>"gravityflow_approval_new_status_step",
                    "name"=> "gravityflow_approval_new_status_step_".$step_id,
                    "value"=>""
                ],
                [
                    "type"=>"button",
                    "buttonType"=>"submit",
                    "value"=>"approved",
                    "class"=>"btn-success",
                    "label"=> esc_html__('Approve','gravityflow'),
                    "action"=>[
                        [
                            "set_id"=>"gravityflow_approval_new_status_step",
                            "to"=>"approved"
                        ]
                    ]
                ],
                [
                    "type"=>"button",
                    "buttonType"=>"submit",
                    "value"=>"rejected",
                    "class"=>"btn-failure",
                    "label"=> esc_html__('Reject','gravityflow'),
                    "action"=>[
                        [
                            "set_id"=>"gravityflow_approval_new_status_step",
                            "to"=>"rejected"
                        ]
                    ]
                ]
            ];
        }
        else if($step instanceof Gravity_Flow_Step_User_Input){
            $action = [];

            $default_status = $step->default_status ? $step->default_status : 'complete';

            if (in_array($default_status, array('hidden','submit_buttons'), true)) {
                array_push($action, [
                    "type"=>"hidden",
                    "id"=> "gravityflow_status_hidden",
                    "name"=> "gravityflow_status",
                    "value"=>"complete"
                ]);
            }
            else{
                $in_progress_label = esc_html__('In progress', 'gravityflow');
                $complete_label = esc_html__('Complete', 'gravityflow');

                array_push($action,[
                    "type"=>"radio",
                    "id"=>"gravityflow_in_progress",
                    "name"=>"gravityflow_status",
                    "checked"=> $default_status == 'in_progress',
                    "value"=> "in_progress",
                    "label"=> $in_progress_label
                ],[
                    "type"=>"radio",
                    "id"=>"gravityflow_complete",
                    "checked"=> $default_status == 'complete',
                    "name"=>"gravityflow_status",
                    "value"=>"complete",
                    "label"=> $complete_label
                ]);

            }

            if($step->default_status == 'submit_buttons'){
                $save_process_button_text = esc_html('Save','gravityflow');
                $submit_button_text = esc_html__('Submit', 'gravityflow');

                array_push($action,[
                    "type"=>"submit",
                    "value"=> $save_process_button_text,
                    "id"=> "gravityflow_save_progress_button",
                    "name"=> "in_progress",
                    "disabled"=> false,
                    "action"=> [
                        [
                            "set_id"=>"action",
                            "to"=> "update"
                        ],
                        [
                            "set_id"=>"gravityflow_status_hidden",
                            "to"=>"in_progress"
                        ]
                    ]
                ], [
                    "type"=> "submit",
                    "id"=>"gravityflow_submit_button",
                    "disabled"=>false,
                    "action"=>[
                        [
                            "set_id"=>"action",
                            "to"=>"update"
                        ],
                        [
                            "set_id"=>"gravityflow_status_hidden",
                            "to"=>"complete"
                        ]
                    ],
                    "value"=>$submit_button_text,
                    "name"=>"save"
                ]);
            }
            else{
                $button_text = $step->default_status == 'hidden' ? esc_html__( 'Submit', 'gravityflow' ) : esc_html__( 'Update', 'gravityflow' );

                array_push($action,[
                    "type"=>"submit",
                    "value"=> $button_text,
                    "name"=> "save",
                    "disabled"=>false,
                    "id"=>"gravityflow_update_button",
                    "action"=>[
                        [
                            "set_id"=> "action",
                            "to"=>"update"
                        ]
                    ]
                ]);
            }
        }
    }

    if($action){
        array_unshift($action, [
            "type"=> "section",
            "label"=> "Action"
        ]);
    }

    return $action;
}

function get_workflow_info($current_step,$form, $entry){
    $date_format = apply_filters('gravityflow_date_format_entry_detail','');
    $results = [];
    $date_created = Gravity_Flow_Common::format_date($entry['date_created'],$date_format, false, true);
    $last_modified = Gravity_Flow_Common::format_date($entry['workflow_timestamp'],$date_format, false, true);
    $creator = get_display_name($entry['created_by']);
    $assigne_ul = "<ul>";

    if($current_step !== false && $current_step instanceof Gravity_Flow_Step){
        $step_name = $current_step->get_name();
        
        if(get_class($current_step) != "Gravity_Flow_Step"){

            foreach ($current_step->get_assignees() as $assigne) {
                $label = $assigne->get_status_label();

                $assigne_ul .= "<li>$label</li>";
            }
            $assigne_ul .= "</ul>";
        }

        array_push($results,[
            "type"=>"section",
            "label"=>"Workflow"
        ], [
            "type"=> "text",
            "label"=> "Envoyée par",
            "value"=> $creator,
        ], [
            "type"=> "text",
            "label"=> "Envoyée",
            "value"=> $date_created
        ], [
            "type"=> "text",
            "label"=> "Mis à jour récente",
            "value"=> $last_modified
        ], [
            "type"=> "text",
            "label"=> $step_name,
            "value"=> $assigne_ul
        ]);
    }

    return $results;
}

function get_upload_data_settings($html){
    preg_match("/data-settings=['\"]([^'\"]+?)['\"]/", $html, $matches);

    error_log("MATCH IS ".print_r($matches,true));

    if(count($matches) > 1){
        $j = htmlspecialchars_decode($matches[1]);
        error_log("JOLIADED $j");
        error_log("FINKA ".print_r(json_decode($j),true));
        return json_decode(htmlspecialchars_decode($matches[1]));
    }

    return null;
}

function handle_choice($field){
    $choices = null;

    if(!empty($field->choices)){
        $choices = array_map(function($choice){
            return [
                "text"=> $choice['text'],
                "value"=> $choice['value']
            ];

        }, $field->choices);
    }

    return $choices;
}

function build_inbox_editable_result($form,$entry,$current_step){
    require_once ABSPATH . "/wp-content/plugins/gravityflow/includes/pages/class-entry-editor.php";

    $results = [[]];
    $current_index = 0;
    $entry_editor = new Gravity_Flow_Entry_Editor( $form, $entry, $current_step, 0 );
    $entry_editor->add_hooks();
    $form = GFFormDisplay::gform_pre_render($form,'form_display', );
    $fields = $form['fields'];

    foreach($fields as $field){
        $field->set_context_property('rendering_form',true);
        $display = true;
        $rules = false;
        $actionType = null;
        $logicType = null;
        $value = "";
        $current_array = &$results[$current_index];

        if(!empty($field->conditionalLogic)){
            $rules = $field->conditionalLogic['rules'];
            $actionType = $field->conditionalLogic['actionType'];
            $logicType = $field->conditionalLogic['logicType'];
        }

        if($entry_editor->is_hidden_field($field)){
            $display = false;
        }

        if($field->type == 'section'){
            $section_fields = $entry_editor->get_section_fields($field->id);

            if ( $entry_editor->section_fields_hidden( $section_fields )
                 || ( $entry_editor->is_section_hidden( $field, $section_fields ) && empty( $field->conditionalLogic ) )
            ) {
                continue;
            }
            if(!empty($current_array)){
                $results[++$current_index] = [];
                $current_array = &$results[$current_index];
            }
        }

        if($entry_editor->is_editable_field($field)){
            $label = $field->label;
            $_value = get_entry_form_value($form,$entry,$field);
            $_leaf_value = (!empty($_value)) ? get_entry_form_value($form,$entry,$field,true) : $value;
            $result = [
                "type"=>"edit", 
                "id"=> $field->id,
                "fieldType"=> $field->type,
                "required"=> $field->isRequired == 1, 
                "label"=> $field->label, 
                "value"=> $_value, 
                "leaf_value"=> $_leaf_value, 
                "inputs"=> $field->inputs
            ];

            $choices = handle_choice($field);
            $result['choices'] = $choices;
            $result['inputs'] = $field->inputs;

            if($field->type == 'section'){
                $result['type'] = 'section';
            }
            if($field->type == 'fileupload'){
                $field_container = GFFormDisplay::get_field($field);

                if($field_container){
                    $data_settings = get_upload_data_settings($field_container);

                    if($data_settings){
                        $result['data-settings'] = $data_settings;
                    }
                    else{
                        error_log(sprintf("Coudln't retrieve data-settings from field with label %s and id %s with html %s and result %s", $field->label, $field->id, $field_container, $data_settings));
                    }
                }
                else{
                    error_log(sprintf("Coudln't retrieve field container html from field with label %s and id %s", $field->label, $field->id));
                }

            }

            if($field->type == 'workflow_assignee_select'){
                $result['value'] = $field->get_choices("");
            }

            if($field->type == 'form'){
                gpnf_gravityflow();

               $_GET['lid'] = $entry['id'];

                $f_value = GFFormDisplay::get_field_content($field,"",false, $form['id'],$form);
                $nested_form = gp_nested_forms();
                $inner_form = $field->gpnfForm;
                $result['value'] = $f_value;
                $result['entries'] = $nested_form->get_submitted_nested_entries( $form, $field->id );
                $result['gpfnfForm'] = $inner_form;
                $result['gform_ajax'] = html_entity_decode(GFFormDisplay::prepare_ajax_input_value($inner_form, null, 1, 0, "gravity-theme"));
                $result['delete_nonce'] = wp_create_nonce('gpnf_delete_entry');
                $result['action_url'] = admin_url('admin-ajax.php');
                $result['edit_nonce'] = wp_create_nonce( 'gpnf_edit_entry' );

                $result['gpfnfields'] = array_map(function($field_id) use ($inner_form){

                    if((int)$field_id !== 0){
                        $field = GFFormsModel::get_field($inner_form,$field_id);
                        $choices = handle_choice($field);

                        return [
                            "type"=> $field->type,
                            "label"=> $field->label,
                            "id"=> $field_id,
                            "choices"=> $choices,
                            "inputs"=> $field->inputs
                        ];
                    }
                    else{
                        return [
                            "type"=> "text",
                            "label"=> $field_id,
                            "id"=> $field_id
                        ];
                    }
                }, $field->gpnfFields);
            }
        }
        else{
            $_value = get_entry_form_value($form,$entry,$field);
            $_leaf_value = (!empty($_value))? get_entry_form_value($form,$entry,$field,true) : $_value;

            $result = [
                "type"=> $field->type,
                "value"=> $_value,
                "leaf_value"=> $_leaf_value,
                "label"=> $field->label,
                "id"=> $field->id
            ];

            switch ($field->type) {
                case 'page':
                    $result = null;
                    break;
                case 'html':
                    $content = GFCommon::replace_variables($field->content, $form, $entry, false, true, false, 'html');
                    $content = do_shortcode($content);
                    $result['value'] = $content;
                    break;
                case 'section':
                    break;
                default:
                    $result['type'] = 'text';
                    break;
            }
            //$result = handle_non_editable_field($form,$entry,$current_step,$field,true);

            if($field->visibility == 'hidden'){
                $display = false;
            }

        }

        if(!empty($result)){
            $result['rules'] = $rules;
            $result['display'] = $display;
            $result['actionType'] = $actionType;
            $result['logicType'] = $logicType;

            array_push($current_array,$result);
        }
    }

    $entry_editor->remove_hooks();

    return $results;
}

function build_inbox_results($form,$entry,$current_step){
    require_once ABSPATH . "/wp-content/plugins/gravityflow/includes/pages/class-entry-detail.php";

    if(!Gravity_Flow_Entry_Detail::is_permission_granted($entry,$form,$current_step)){
    	return wp_send_json_error(["msg"=> esc_attr__( "You don't have permission to view this entry.", 'gravityflow' ) ]);
    }

    $results = [[]];
    $current_index = 0;
    $display_empty_fields = false;
    $is_assignee = $current_step ? $current_step->is_user_assignee() : false;
    $complete_step = gravity_flow()->get_workflow_complete_step($form['id'], $entry);
    $editable_fields = $current_step->get_editable_fields();

    if(! $is_assignee){
        if($current_step){
            $display_field_step = ! empty($_POST) ? $current_step : gravity_flow()->get_workflow_start_step($form->ID,$entry);

            if($current_step->get_current_assignee_status() == 'complete' || $current_step->get_current_assignee_status() == 'approved'){
                $display_field_step = gravity_flow()->get_workflow_complete_step($form->ID,$entry);
            }
        }
        else{
            $display_field_step = $complete_step;
        }
    }

    if(empty($editable_fields)){
        error_log("LOOTING NON EDITABLE FIELD");
        foreach ($form['fields'] as &$field) {
            $current_array = &$results[$current_index];

            $is_product_field = GFCommon::is_product_field($field->type);
            $result = null;

            $display_field = $current_step && $is_assignee ? Gravity_Flow_Entry_Detail::is_display_field($field,$current_step,$form,$entry,$is_product_field) : Gravity_Flow_Entry_Detail::is_display_field($field, $display_field_step, $form, $entry, $is_product_field);
            $field->gravityflow_is_display_field = $display_field;

            if($field->type == 'section' || $display_field){
                $result = handle_non_editable_field($form,$entry,$current_step,$field);

                if(!empty($result)){
                    error_log("FIELD label ".$field->label." with id ".$field->id);
                }

                if($field->type == 'section' && $result){
                    error_log("label ".$field->label);
                    if(!empty($results[$current_index])){
                        $results[++$current_index] = [];
                        $current_array = &$results[$current_index];
                    }
                }
            }

            if(!empty($result)){
                array_push($current_array,$result);
                error_log(sprintf("NEW PUSH WITH field-id %s with label %s %s . ARRAY IS %s", $field->id,$field->label,print_r($current_array,true), print_r($result,true)));
            }
        }
    }
    else{
        $results = build_inbox_editable_result($form,$entry,$current_step);

        array_push($results,[
            [
                "type"=>"hidden",
                "name"=> "is_submit_".$form['id'],
                "value"=> '1'
            ]
        ]);
    }

    if(count($results)> 0){
        $step_id = $current_step ? $current_step->get_id() : '';

        array_push($results,[
            [
            "type"=>"hidden",
            "name"=>"gforms_save_entry",
            "value"=> wp_create_nonce("gforms_save_entry")
            ],
            [
            "type"=>"hidden",
            "name"=>"step_id",
            "value"=>$step_id
            ]
        ]);
    }

    array_unshift($results,[
        [
            "type"=>    "hidden",
            "name"=>    "_action",
            "id"=>      "action",
            "value"=>   ""
        ],
        [
            "type"=>    "hidden",
            "name"=>    "save",
            "value"=>   "Update"
        ]
    ]
    );

    return $results;
}

function get_entry_form_value($form,$entry,$field,$justLeaf = false){
    $value = RGFormsModel::get_lead_field_value($entry, $field);

    if($justLeaf){
        return $value;
    }
    return Gravity_Flow_Entry_Detail::get_display_value($value,$field,$entry,$form);
}

function handle_non_editable_field($form,$entry,$current_step,$field,$display_empty_fields=false){
    $result = [
        "type"=> $field->type,
        "label"=> $field->label,
        "id"=> $field->id
    ];

    switch (RGFormsModel::get_input_type( $field )) {
        case 'section':
            if(! Gravity_Flow_Entry_Detail::is_section_empty($field,$current_step,$form, $entry, $display_empty_fields)){
                return $result;
            }
            else{
                return null;
            }
            break;
        case 'html':
            $content = GFCommon::replace_variables($field->content, $form, $entry, false, true, false, 'html');
            $content = do_shortcode($content);
            $result['value'] = $content;
            return $result;
            break;
        default:
            $display_value = get_entry_form_value($form,$entry,$field);
            $label = Gravity_Flow_Entry_Detail::get_label($field, $entry);
             if($display_empty_fields || ! empty($display_value) || $display_value === '0'){
                $result['type'] = 'text';
                $result['value'] = $display_value;
                $result['label'] = $label;
                return $result;
            }
            
            return null;

            break;
    }
}

function get_last_modified($date_string){
    $t = strtotime($date_string);

    return date("D, d M Y h:i:s",$t) . " GMT";
}


function load_gravityflow_inbox(){
    // The global $post must be set in order for the gravityflow class to pass the request and not return an empty string
    
    /*check_ajax_referer('gravityflow_inbox_nonce', 'security');*/

    if(!isset($_GET['form_ids'])){
        http_response_code(400);

        return wp_send_json_error("No form_ids given");
    }

    $form_ids = $_GET['form_ids'];
    $current_user = wp_get_current_user();
    $offset = isset($_REQUEST['offset'])? $_REQUEST['offset']: 0;
    $limit = isset($_REQUEST['limit'])? $_REQUEST['limit']: 10;
    $required_fields = ["form_id","workflow_step","created_by","id","date_created"];
    $required_form_fields = ["objet","expéditeur","numéro","référence","date"];
    $total = 0;
    
    if(isset($_REQUEST['term'])){
        $results = search_reception($_REQUEST['term'],$offset,$limit);
        $entries = $results['entries'];
        $total = $results['total'];
    }
    else{
        $search_criteria = build_search_criteria();

        if(isset($_REQUEST['excel'])){
            $offset = 0;
            $limit = 1000000;
        }

        $entries = Gravity_Flow_API::get_inbox_entries( ["form_id"=>$form_ids, "paging"=> ["offset"=>$offset, "page_size"=> $limit]],$total);
    }

    $fields_values = [];
    
    foreach (explode(",",$form_ids) as $form_id){
        $fields_values[$form_id] = [];
        $form = GFAPI::get_form($form_id);
        $id_founds = [];

        if($form){
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
    }
    
    $shown = false;
    $filtered_entries = array_map(function($entry) use ($required_fields, &$shown, $required_form_fields){
        $display_name = get_display_name($entry['created_by']);
        $step_name = get_current_step_name($entry['form_id'], $entry['workflow_step']);
        $form = GFAPI::get_form($entry['form_id']);
        $new_entry = [];

        if($display_name){
            $new_entry['created_by'] = $display_name;
        }
        if($step_name){
            $new_entry['workflow_step'] = $step_name;
        }

        $new_entry['form_id'] = $entry['form_id'];
        $new_entry['id'] = $entry['id'];

        foreach ($entry as $key => $value) {
            $parsed_key = (int)$key;

            if ($parsed_key > 0) {
                if($form){
                    $field = array_find($form['fields'],function($field) use ($parsed_key){
                        return $field->id == $parsed_key;
                    });
                    if($field){

                        if(($label = array_find($required_form_fields,function($label) use ($field){
                            return strpos(strtolower($field->label),$label) !== false;
                        }))){
                            if(!isset($new_entry[$label])){
                                $new_entry[$label] = $entry[$key];
                            }
                        }
                    }
                }
                else{
                    error_log("Key $key with no form found");
                }
            }
        }
        
       return $new_entry; 
    },$entries);

    if(isset($_REQUEST['excel'])){

        flogs("MY GET ARE %s", print_r($_GET,true));

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $excel_data = [$required_form_fields];
        $i = 0;

        flogs("FILTERED ENTRIES %s", print_r($filtered_entries,true));

        while($i < count($filtered_entries)){
            $dup = [];

            foreach ($required_form_fields as $key => $value) {
                $dup[$key] = $filtered_entries[$i][$key];
            }

            array_push($excel_data, $dup);

            $i++;
        }

        header("Content-Type:application/vdn.opencmlformats-officedocument.spreadsheetml.sheet");
        header("Content-Disposition: attachment; filename=stuff.xlsx");
        header("Cache-Controle: no-cache;no-store");

        flogs("EXCEL DATA IS %s",print_r($excel_data,true));

        $sheet->fromArray($excel_data);
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;


    }
    
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

function build_search_criteria($include_date=true){
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
    if($include_date){
        $search_criteria['start_date'] = $start_date;
        $search_criteria['end_date'] = $end_date;
    }
    $search_criteria['status'] = $status;
    
    return $search_criteria;
}

function set_search_criteria($term,$fields){
    $search_criteria = build_search_criteria(false);
    $field_filters = [];
    
    foreach ($fields as $field){
        array_push($field_filters,["key"=> null, "operator"=> "contains", "value"=> $term]);
    }
    $field_filters['mode'] = "all";
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