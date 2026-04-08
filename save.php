<?php
header('Content-Type: application/json');

// 检查是否是POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(array('success' => false, 'message' => '只允许POST请求'));
    exit;
}

// 获取POST数据
$content = isset($_POST['content']) ? $_POST['content'] : '';
$filename = isset($_POST['filename']) ? $_POST['filename'] : '';

// 验证数据
if (empty($content) || empty($filename)) {
    echo json_encode(array('success' => false, 'message' => '内容和文件名不能为空'));
    exit;
}

// 验证文件名
if (!preg_match('/^[a-zA-Z0-9_-]+\.html$/', $filename)) {
    echo json_encode(array('success' => false, 'message' => '文件名格式不正确'));
    exit;
}

// 确保目录存在
$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    if (!@mkdir($uploadDir, 0777, true)) {
        echo json_encode(array('success' => false, 'message' => '无法创建上传目录'));
        exit;
    }
}

// 构建完整的文件路径
$filepath = $uploadDir . $filename;

// 尝试保存文件
try {
    if (@file_put_contents($filepath, $content) === false) {
        throw new Exception('文件写入失败');
    }
    
    echo json_encode(array('success' => true, 'message' => '文件保存成功'));
} catch (Exception $e) {
    echo json_encode(array('success' => false, 'message' => $e->getMessage()));
}
?> 