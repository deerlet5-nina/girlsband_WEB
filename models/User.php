<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $student_id;
    public $password;
    public $created_at;
    public $last_login;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 验证用户登录
    public function login() {
        $query = "SELECT id, student_id, password 
                FROM " . $this->table_name . "
                WHERE student_id = :student_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $this->student_id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($this->password === $row['password']) {
                // 更新最后登录时间
                $this->updateLastLogin($row['id']);
                return true;
            }
        }
        return false;
    }

    // 更新最后登录时间
    private function updateLastLogin($user_id) {
        $query = "UPDATE " . $this->table_name . "
                SET last_login = NOW()
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
    }

    // 验证学号格式
    public function validateStudentId($student_id) {
        return preg_match('/^233\d{7}$/', $student_id);
    }

    // 创建新用户
    public function create() {
        if(!$this->validateStudentId($this->student_id)) {
            return false;
        }

        $query = "INSERT INTO " . $this->table_name . "
                (student_id, password, created_at)
                VALUES
                (:student_id, :password, NOW())";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":student_id", $this->student_id);
        $stmt->bindParam(":password", $this->password);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?> 