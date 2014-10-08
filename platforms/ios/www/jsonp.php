<?php

/*
	[UCenter] (C)2001-2099 Comsenz Inc.
	This is NOT a freeware, use is subject to license terms

	$Id: tag.php 1059 2011-03-01 07:25:09Z monkey $
*/

!defined('IN_UC') && exit('Access Denied');

class jsonpcontrol extends appcontroller {

	function __construct() {
        parent::__construct();
        /*
        $server_var = parse_url($_SERVER['HTTP_REFERER']);
		$rehost = $server_var['host'];
		$allow_host = array(
			'l.biketo.com',
			'www.biketo.com',
			'holiday.biketo.com',
			'holiday.l.biketo.com',
		);
		if(!in_array($rehost, $allow_host)){
			exit();
		}*/
        $this->init_user();
    }

    // holiday 使用
    function onuserinfo(){
    	if($this->user){ // 已登录，显示用户信息
			$this->view('info.php', array(
				'user' => $this->user,
			));
    	}
    	else{ // 未登录，显示登录框
    		$this->view('login.php', array(
			));
    	}
    }

	function onuserjsonp(){
		$reuser = array();
		if(!$this->user){
			$reuser['islogin'] = false;
			echo $_GET["callback"].'('.json_encode($reuser).');';
			exit();
		}
		$useraddr = $this->load_model('appuser')->user_addr();
		$reuser = array();
		$reuser['islogin'] = true;
		$reuser['userid'] = $this->user['userid'];
		$reuser['username'] = $this->user['username'];
		$reuser['email'] = $this->user['email'];
		$reuser['address'] = $reuser['address'];
		$reuser['company'] = $reuser['company'];
		$reuser['phone'] = $reuser['phone'];
		$reuser['truename'] = $reuser['truename'];
		$reuser['address'] = $reuser['address'];
		$reuser = $this->toUTF8($reuser);
		echo $_GET["callback"].'('.json_encode($reuser).');';
		exit();
	}

	function onloginjsonp(){
		$re = array();
		$re['status'] = false;
		$re['scripts'] = array();
		if($this->user){
			$re['status'] = true;
			echo $_GET["callback"].'('.json_encode($re).');';
			exit();
		}
		$username = $this->toGBK($_GET['username']);
		$userpass = $_GET['userpass'];
		if(empty($username) || empty($userpass)){
			$re['status'] = false;
			echo $_GET["callback"].'('.json_encode($re).');';
			exit();
		}
		$scripts = $this->load_model('appuser')->jsonLogin($username,$userpass);
		if($scripts === false){
			$re['status'] = false;
			echo $_GET["callback"].'('.json_encode($re).');';
			exit();
		}
		$re['status'] = true;
		$re['scripts'] = $scripts;
		echo $_GET["callback"].'('.json_encode($re).');';
		exit();
	}

	function onlogoutjsonp(){
		$re = array();
		$re['status'] = true;
		if(!$this->user){
			echo $_GET["callback"].'('.json_encode($re).');';
			exit();
		}
		$scripts = $this->load_model('appuser')->jsonLogout();
		$re['scripts'] = $scripts;
		echo $_GET["callback"].'('.json_encode($re).');';
		exit();
	}


	/** ---------------------------------
	 *【 BIKETO新闻客户端API 】
	 *
	 * 2014-03-03（v1.0）
	 * 	1、新闻列表
	 * 	2、详情新闻
	 * 	
	 * 2014-06-22（v2.0）
	 * 	新添功能：
	 * 	1、图集
	 * 	2、幻灯片
	 * 	3、视频
	 * 	4、会员中心
	 -----------------------------------*/
	function onm() {
		// 设置接收数据 格式
		header('Content-Type: application/json; charset=utf-8');
		header("Access-Control-Allow-Origin:*");

		// 获取客户端发送来的数据数据 （前端使用backbone save方法）
		$date = json_decode(file_get_contents("php://input"));

		$classid = $_GET['classid'];
		$page = $_GET['page'] ? $_GET['page'] : '1';
		$aid = $_GET['aid'];
		$showType = $_GET['showType'];

		if ( !is_numeric($classid) || !is_numeric($page) || $page == 0 ) {
			exit();
		}

		//清楚指定html标签
		function clearHtmlTag($str) {
			$replaceStr = array("style", "title", "alt", "width", "height", "border", "hspace", "vspace", "valign", "align", "bordercolor", "href");
			$arrLength = count($replaceStr);
			for ($i = 0; $i < $arrLength; $i++ ) {
				$splic = "|";
				if ($i === $arrLength) {
					$splic = "";
				}
				$arrReg .= '('.$replaceStr[$i].'=\"[^\"]*?\")'.$splic;
			}
			$reg = "/".$arrReg."/i";
			$content = preg_replace($reg, "", $str);
			return $content;
		}

		// 图集分割
		function splitStr($str) {
			global $public_r, $spic;
			$morepic=$str;
			$rexp = "\r\n";
			$fexp = "::::::";
			$rstr = "";
			$sdh = "";
			$w_morepic = "";
			$spic = "";
			$rr = explode( $rexp,$morepic ); 
			$count = count( $rr );

			for ( $i = 0; $i < $count; $i++ ) {
			  ( $i == ($count-1) ) ? $fh="" : $fh=",";
			  $fr = explode( $fexp, $rr[$i] );
			  $smallpic = $fr[0]; //小图
			  $bigpic = $fr[1]; //大图
			  $title =  htmlspecialchars( $fr[2] ); //名称

			  $arrSty[] = array('titlepic' => $bigpic, 'title' => $title);
			}

			return $arrSty;
		}

		// 分页处理
		if ($page) {
			$pageSize = 8;

			( $showType === 'slideList' ) && $pageSize = 3;
			( $showType === 'pictureList' ) && $pageSize = 4;

			$pageval = $page;
			$page = ($pageval - 1) * $pageSize;
			$page .= ',';
		}

		// 栏目id处理
		switch ($classid) {
			// 最新
			case '1':
				$where = '';
				break;

			// 头条
			case '2':
				$where = "n.isgood = 1 AND";
				break;

			// 频道
			case '88':
			case '90':
			case '93':
				$where = "c.bclassid = '".$classid."' AND";
				break;

			// 默认
			default:
				$where = "c.classid = '".$classid."' AND";
				break;
		}

		/**
		 * [ 显示类型处理 ]
		 * slideList	幻灯片集
		 * newsList 	新闻列表
		 * pictureList	图集列表
		 * videoList	视频列表
		 */
		
		// 幻灯片集 or 新闻列表处理
		if ($showType === 'slideList' || $showType === 'newsList' || $showType === 'videoList') {

			/**
			 * [ 幻灯片集 ]
			 * 如果是幻灯片列表调用需要关联查询新闻表 （用于获取文章第一张图片作为标题图显示）
			 * 查询条件：查询一周内，被设为头条或推荐的文章，
			 */
			if ($showType === 'slideList') {
				$joinTable = 'LEFT JOIN phome_ecms_news_data_1 d ON n.id = d.id';
				$dataField = ', d.id, d.newstext';
				$where .= ' (n.firsttitle >= 1 OR n.isgood >= 1) AND n.newstime > UNIX_TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 4 WEEK)) AND'; // 获得近两周内的头条
				// $order = 'ORDER BY RAND()';
				$order = 'ORDER BY n.newstime DESC';
			}
			else {
				$joinTable = $dataField = '';
				$order = 'ORDER BY n.newstime DESC';
			}

			$newsListSql = $this->db->query("SELECT n.id, n.classid, n.title, n.newstime, n.titlepic, n.isgood, c.classid, c.classname, c.bclassid, n.smalltext, n.isgood $dataField
											 FROM phome_ecms_news n
											 LEFT JOIN phome_enewsclass c ON n.classid = c.classid 
											 $joinTable
											 WHERE $where n.titlepic IS NOT NULL $order LIMIT $page $pageSize");

			while ( $r=$this->db->fetch( $newsListSql ) ) {
				$model[] = array(
					'id' => $r['id'],
					'classid' => $r['classid'],
					'title' => $this->toUTF8(sub($r['title'], 0, 30, false)),
					'titlepic' => $r['titlepic'],
					'newstext' => stripSlashes( $this->toUTF8($r['newstext']) ),
					'smalltext' => stripSlashes( $this->toUTF8(sub($r['smalltext'], 0, 60, false)))
				);
			}

			// 幻灯片集
			if ($showType === 'slideList' && $classid === '120') {

				for ( $i = 0; $i < count( $model ); $i++ ) {
					$news = $model[$i]["newstext"];
				    preg_match_all("/src=\"\/?(.*?)\"/", $news, $match);

				    // 如果第一个链接是外连则获取第二链接
				   	(  strstr($match[1][0], "http://") != '' ) && ( $match[1][0] = $match[1][1] );

					$model[$i]["titlepic"] = "/".$match[1][0];
					$model[$i]["titlepic"] = str_replace("http://www.biketo.com", "" ,$model[$i]["titlepic"]);
					unset( $model[$i]['newstime'], $model[$i]['smalltext'], $model[$i]['newstext'] );
				}

			}

			// 新闻列表
			if ($showType === 'newsList') {
				for ( $i = 0; $i < count( $model ); $i++ ) {
					unset( $model[$i]['newstext'], $model[$i]['newstime'] );
				}
			}

		}

		// 图集列表
		if ($showType === 'pictureList') {
			$picListSql = $this->db->query("SELECT p.id, p.classid, p.title, p.picsay, p.titlepic, d.morepic, d.id
											FROM phome_ecms_photo p
											LEFT JOIN phome_ecms_photo_data_1 d ON p.id = d.id
											WHERE p.classid = 120
											ORDER BY p.newstime DESC LIMIT $page $pageSize");

			// loop
			while ($r = $this->db->fetch( $picListSql )) {
				$model[] = array(
					'id' => $r['id'],
					'classid' => $r['classid'],
					'title' => $this->toUTF8(sub($r['title'], 0,100, false)),
					'piclist' => splitStr( stripSlashes($this->toUTF8($r['morepic'])) )
				);
			}

			for ($i = 0; $i < count( $model ); $i++) {
				$model[ $i ]["titlepic"] = $model[ $i ]['piclist'][ 0 ]['titlepic'];
				$model[ $i ]['count'] = count($model[ $i ]['piclist']);
				unset( $model[$i]['piclist'] );
			}

		}

		// 视频列表
		if ($showType === 'videoList') {
			$videoListSql = $this->db->query("SELECT id, classid, title, newstime, titlepic, moviesay, youku_swf
											FROM phome_ecms_photo v
											WHERE classid = 120
											ORDER BY newstime DESC LIMIT $page $pageSize");

			// loop
			while ($r = $this->db->fetch( $videoListSql )) {
				$model[] = array(
					'id' => $r['id'],
					'classid' => $r['classid'],
					'title' => $this->toUTF8(sub($r['title'], 0,100, false)),
					'piclist' => splitStr( stripSlashes($this->toUTF8($r['morepic'])) )
				);
			}

			for ($i = 0; $i < count( $model ); $i++) {
				$model[ $i ]["titlepic"] = $model[ $i ]['piclist'][ 0 ]['titlepic'];
				$model[ $i ]['count'] = count($model[ $i ]['piclist']);
				unset( $model[$i]['piclist'] );
			}

		}

		// 详情新闻
		if (is_numeric($aid) && $classid !== '120') {
			
			$nwqsDetailSql = $this->db->fetch1("SELECT d.id, d.newstext FROM `phome_ecms_news_data_1` d WHERE d.id = $aid LIMIT 1");
			$newstext = $nwqsDetailSql['newstext'];
			$model = clearHtmlTag( stripSlashes($this->toUTF8($newstext)) );

		}

		// 详情图集
		if (is_numeric($aid) && $classid === '120') {

			$pictureDetailSql = $this->db->fetch1("SELECT d.id, d.classid, d.morepic FROM `phome_ecms_photo_data_1` d WHERE d.id = $aid LIMIT 1");
			$model = splitStr( $this->toUTF8($pictureDetailSql['morepic']) );

		}

		die(json_encode($model));
	}

}

?>