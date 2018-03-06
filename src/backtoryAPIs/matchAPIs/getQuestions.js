var Backtory = require('backtory-sdk');
var imagesURL='http://storage.backtory.com/quizbombi_images/';
exports.handler = function(requestBody, context) {
 	//context.log(JSON.stringify(requestBody));
	getPlayersFields(context,requestBody.participants,function(fields,ttype,level){
		context.log("ttype:"+ttype);
		if(ttype==5)
		{
			context.log("fields:"+fields);
			getQuestionsIds(context,fields,0,6,function(questions,Ids){
				succeed(context,{questions:questions,Ids:Ids});
			},level);		
		}
		else
		{
                    context.log("fields:"+fields);
			getQuestionsPack(fields,0,[],function(questions){
				succeed(context,{questions:questions});
			},context,ttype,level);
		}
	});
};
function getQuestion_allFields(ids,callback,questions,i,context,count,ttype,level)
{
	var TQuestions = Backtory.Object.extend("TQuestions");
	var qQuery=new Backtory.Query(TQuestions);
	qQuery.skip(ids[i]);
	qQuery.limit(1);
        	qQuery.lessThanOrEqualTo("level",level);

	qQuery.select("_id", "question","ans1","ans2","ans3","ans4","correctAns","field","image_path");
	qQuery.find({
		success: function(Qs) {
			
			questions[i]=Qs[0];
			context.log("question"+i+":"+questions[i].get("_id"));
			var image_path=questions[i].get("image_path");
			
			if(image_path&&image_path.length>0)
			questions[i].set("image_path",imagesURL+image_path);
			var t2=[1,2,3,6];
			var r=Math.ceil(Math.random()*3);
			var types=[0,2,0,4,5,0,0,0,0,0];
			types[1]=t2[r];
			if(count==10)
			{
				types=[0,5,0,2,4,0,0,0,0,5];
				types[6]=t2[r];
			}
			if(count>10)
				{
					types=[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];
				}
			var arr=[1,2,3,4];
			arr=shuffleArray(arr);
			var anses=["","","",""];
			for(var k=0;k<4;k++)
			{
				var ans="ans"+(k+1);
				anses[k]=questions[i].get(ans);
			}
			for(var k=0;k<4;k++)
			{
				var ans="ans"+(k+1);
				questions[i].set(ans,anses[arr[k]-1]);
				if(arr[k]==1)
					questions[i].set("correctAns",k+1);
			}
			questions[i].set("type",types[i]);
				callback(questions);
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function getQuestionsIds(context,g_fields,g_i,g_type,callback,level)
{
	var TQuestions = Backtory.Object.extend("TQuestions");
	var qQuery=new Backtory.Query(TQuestions); 
	qQuery.lessThanOrEqualTo("level",level);
	var count=300;
	qQuery.count({
		success: function(max) {
			count=Math.min(count,max);
			var g_Ids=randomNumberGenerator(max,count);
			
			getQuestionsPack_allFields(0,[],function(questions){
				callback(questions,g_Ids);
			},context,g_type,g_Ids,level);
			
		},
		error: function(error) {
			fail(context,error);
		}
	});
	
}
function getQuestionsPack_allFields(l,_questions,callback,context,ttype,Ids,level)
{
	getQuestion_allFields(Ids,function(questions){
		context.log("questions.length:"+questions.length);
		if(l==10)
			callback(questions);
		else
			getQuestionsPack_allFields(l+1,questions,callback,context,ttype,Ids,level);
	},_questions,l,context,11,ttype,level);
	
}
function getPlayersFields(context,ps,callback)
{
	var players_ids=[];
// 	context.log("ps:"+JSON.stringify(ps));
	for(var i=0;i<ps.length;i++)
		players_ids[i]=ps[i].userId;
// 	context.log("players_ids:"+JSON.stringify(players_ids));
	var fs=[];
	var TPlayers = Backtory.Object.extend("TPlayers");
	var qQuery=new Backtory.Query(TPlayers);
	qQuery.containedIn("userId",players_ids);
	qQuery.find({
		success: function(players) {
// 			context.log("players"+JSON.stringify(players));
			var qCount=players[0].get("qCount");
			var ttype=1;
			//context.log("qCount"+qCount);
			if(qCount>100&&qCount<200)
				{
					ttype=2;
				qCount=qCount-100;
				}
			else if(qCount>200&&qCount<300)
				{
					ttype=3;
				qCount=qCount-200;
				}
                                else if(qCount>300&&qCount<400)
				{
				qCount=qCount-300;
				}
			else if(qCount>500&&qCount<600)
				{
					ttype=4;
				qCount=qCount-500;
				}
			else if(qCount>600&&qCount<700)
				{
					ttype=5;
				qCount=qCount-600;
				}
			else if(qCount>700&&qCount<800)
				{
					ttype=6;
				qCount=qCount-700;
				}
			else if(qCount>800&&qCount<900)
				{
					ttype=7;
				qCount=qCount-800;
				}
			

			
			for(var j=0;j<qCount;j++)
			{
				
				var k= Math.ceil((Math.random()+0.01)*(7.9));
				if(j<players.length)
					k=players[j].get("favoriteField")[0];
				else if(j<players.length+3)
					k=players[0].get("favoriteField")[j-players.length+1];
// 				if(ttype==6)// remove
// 					k=8;//remove
				if(ttype==6&&k==3)
					k=9;
				if(ttype==6&&k==6)
					k=10;
				fs[j]=k;
			}
                        var level=players[0].get("level");
                        for(var kk=1;kk<players.length;kk++)
                            level=level+players[kk].get("level");
                        level=level/players.length;
			
                        if(ttype==5)
                            if(level>4)
                                level=10;
                        
                        if(ttype!=5)
                        {
                            if(level>14)
                                level=10;
                            else
                                level=5;
                        }
                        
			callback(fs,ttype,level);
		},
		error: function(error) {
			fail(context,error);
		}
	});
}
function getQuestion(field,ids,callback,questions,i,context,count,ttype,level)
{
	var TQuestions = Backtory.Object.extend("TQuestions");
	var qQuery=new Backtory.Query(TQuestions);
	qQuery.skip(ids[0]);
	qQuery.limit(1);
	qQuery.equalTo("field",field);
	if(ttype==6)
		{
	//	qQuery.exists("image_path");
			qQuery.contains("image_path", ".jpg");
		}
                qQuery.lessThanOrEqualTo("level",level);
	qQuery.select("_id", "question","ans1","ans2","ans3","ans4","correctAns","field","image_path");
	qQuery.find({
		success: function(Qs) {
			questions[i]=Qs[0];
			var image_path=questions[i].get("image_path");
			if(image_path&&image_path.length>0)
			questions[i].set("image_path",imagesURL+image_path);
			var t2=[1,2,3,6];
			//var t2=[6,6,6,6];
			var r=Math.ceil(Math.random()*3);
			//var types=[0,2,0,4,5,0,0,0,0,0];
			var types=[0,2,0,4,5,0,0,0,0,0];
			types[1]=t2[r];
			if(count==10)
			{
				types=[0,5,0,2,4,0,0,0,0,5];
				types[6]=t2[r];
			}
			if(count>10)
				{
					types=[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];
				}
			var arr=[1,2,3,4];
			arr=shuffleArray(arr);
			var anses=["","","",""];
			for(var k=0;k<4;k++)
			{
				var ans="ans"+(k+1);
				anses[k]=questions[i].get(ans);
			}
			for(var k=0;k<4;k++)
			{
				var ans="ans"+(k+1);
				questions[i].set(ans,anses[arr[k]-1]);
				if(arr[k]==1)
					questions[i].set("correctAns",k+1);
			}
			questions[i].set("type",types[i]);
				callback(questions);
		},
		error: function(error) {
			fail(context,error);
		}
	});
}

function getQuestionsPack(fieldsa,l,_questions,callback,context,ttype,level)
{
// 	context.log(fieldsa);
	var TQuestions = Backtory.Object.extend("TQuestions");
	var qQuery=new Backtory.Query(TQuestions); 
	context.log("level:"+level);
	if(ttype==6)
		{
		//qQuery.exists("image_path");
			qQuery.contains("image_path", ".jpg");
		}
                qQuery.lessThanOrEqualTo("level",level);
	//context.log("fieldsa["+l+"]"+fieldsa[l]);
	qQuery.equalTo("field",fieldsa[l]);
	qQuery.count({
		success: function(max) {
			//context.log("max"+max);
			getQuestion(fieldsa[l],randomNumberGenerator(max,1),function(questions){
                            if(l<fieldsa.length-1)
                                getQuestionsPack(fieldsa,l+1,questions,callback,context,ttype,level);
                            else
					callback(questions);
					
			},_questions,l,context,fieldsa.length,ttype,level);
		},
		error: function(error) {
			fail(context,error);
		}
	});
	
}

function randomNumberGenerator(max,count)
{
	var result = [];
	var i=0;
	while(result.length < count){
		var randomnumber = Math.floor(Math.random()*max);
	//	if(i==0)
// 			randomnumber=max-1;
		if(result.indexOf(randomnumber) > -1) continue;
		result[i] = randomnumber;
		i++;
	}
	return result;
}

function shuffleArray(a) { 
	var i = a.length, t, j;
    a = a.slice();
    while (--i) t = a[i], a[i] = a[j = ~~(Math.random() * (i+1))], a[j] = t;
    return a;
}
function fail(context,error)
{
	context.log("error:"+JSON.stringify(error));
	context.fail(error);
}
function succeed(context,result)
{
 	//context.log("result:"+JSON.stringify(result));
	
		context.succeed(result);
}