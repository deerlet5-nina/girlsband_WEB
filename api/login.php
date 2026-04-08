<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->student_id) &&
    !empty($data->password)
) {
    $user->student_id = $data->student_id;
    $user->password = $data->password;

    if($user->login()) {
        http_response_code(200);
        echo json_encode(array(
            "message" => "登录成功",
            "student_id" => $user->student_id
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "登录失败，学号或密码错误"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "无法登录，数据不完整"));
}
?> 