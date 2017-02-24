<?PHP

	header("Content-Type: application/json; charset=utf-8");
	$con = mysql_connect('localhost','root','');
	mysql_select_db('music');
	mysql_query('set names utf8');

?>