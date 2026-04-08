<?php
session_start();

class Session {
    public static function init() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    public static function get($key) {
        return isset($_SESSION[$key]) ? $_SESSION[$key] : false;
    }

    public static function destroy() {
        session_destroy();
        $_SESSION = array();
    }

    public static function isLoggedIn() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    public static function requireLogin() {
        if (!self::isLoggedIn()) {
            header("Location: /login.php");
            exit();
        }
    }

    public static function setUserData($userData) {
        $_SESSION['user_id'] = $userData['id'];
        $_SESSION['student_id'] = $userData['student_id'];
        $_SESSION['last_activity'] = time();
    }

    public static function checkTimeout($timeout = 1800) {
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
            self::destroy();
            return false;
        }
        $_SESSION['last_activity'] = time();
        return true;
    }
}
?> 