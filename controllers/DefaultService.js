'use strict';

exports.pdiAccountsResourceIDGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * resourceID (String)
  * accountHolderName (String)
  * verificationType (List)
  **/
  var log4js = require( "log4js" );
  log4js.configure( "./config/log4js.json" );
  var logger = log4js.getLogger( "micro-file-appender" );
  logger.debug("Entered Micro Services Layer");
  var config = require("./env.json");

    var examples = {};
  examples['application/json'] = {
  "Account" : {
    "sortcode" : "42397878",
    "accountID" : "849490309",
    "accountHolderName" : "Ritu",
    "incomeVerification" : "Verified and positive",
    "employerVerification" : "Dell Employee",
    "expenditureVerification" : "Not defaulter"
  }
};
  if(args.resourceID.value.length > 0) {

    res.setHeader('Content-Type', 'application/json');

    //res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));

    var request=args.resourceID.value.split("+");

   var accholdername=args.accountHolderName.value;
   var accID=request[1];
   var sc=request[0];
  var dbResult_inVerification;
  var dbResult_exVerification;
  var dbResult_empVerification;
  var resultObject;

  var filter=args.verificationType.value;
    logger.debug("Request for account : "+ request[1]+" , sortcode :" +request[0]+ ", accountHolderName : "+ accholdername + " ,verificationType : " + filter);
   console.log("Request for account : "+ request[1]+" , sortcode :" +request[0]+ ", accountHolderName : "+ accholdername + " ,verificationType : " + filter);

  const cassandra = require('cassandra-driver');

  logger.info("config.DBhost =" +config.DBhost +" config.DBkeyspace= " +config.DBkeyspace);
  const client = new cassandra.Client({contactPoints:[config.DBhost], keyspace:config.DBkeyspace});
  var cql = "SELECT accountno,accountholdername,sortcode,employer_verification,expenditure_verification,income_verification FROM pdi.account WHERE accountholdername=? and accountno=? and sortcode=? ";

  logger.info("Call to Cassandra");

    client.execute(cql, [accholdername,accID,sc], function (err, rows) {
      logger.info("Call returned From Cassandra");
      if (err) {
        logger.error("Error from Backend"+err);
        console.log("Error from Backend");
        res.statusCode=500;
        resultObject={"ErrorCode":"BUS02","ErrorReason":"Error from Backend DB"+err};
          res.end(JSON.stringify(resultObject || {}, null, 2));
        //throw err;
      }


   else if ( typeof(rows.rows[0])!== "undefined"  )
      {
     res.statusCode=200;
     dbResult_inVerification=rows.rows[0].income_verification;
     dbResult_exVerification=rows.rows[0].expenditure_verification;
     dbResult_empVerification=rows.rows[0].employer_verification;

   if(filter=="IN")
   resultObject = {
   accountHolderName :accholdername,accountID :accID,sortcode:sc,
   incomeVerification : dbResult_inVerification };
   if(filter=="EMP")
        resultObject = {
      accountHolderName :accholdername,accountID :accID,sortcode:sc,
        employerVerification :dbResult_empVerification };
   if(filter=="IN,EMP")
           resultObject = {
           accountHolderName :accholdername,accountID :accID,sortcode:sc,
           incomeVerification :  dbResult_inVerification, employerVerification :  dbResult_empVerification};
    if(filter=="EX")
     resultObject = {
     accountHolderName :accholdername,accountID :accID,sortcode:sc,
     expenditureVerification :  dbResult_exVerification };
    if(filter=="IN,EX")
         resultObject = {
         accountHolderName :accholdername,accountID :accID,sortcode:sc,incomeVerification :  dbResult_inVerification,
         expenditureVerification :  dbResult_exVerification };
    if(filter=="EX,EMP")
                 resultObject = {
                 accountHolderName :accholdername,accountID :accID,sortcode:sc,incomeVerification :  dbResult_inVerification,
                 employerVerification :  dbResult_empVerification, expenditureVerification :  dbResult_exVerification};
    if(filter=="IN,EMP,EX" )
                              resultObject = {
                              accountHolderName :accholdername,accountID :accID,sortcode:sc,
                              employerVerification :  dbResult_empVerification, expenditureVerification :  dbResult_exVerification};
        console.log("Data Found");
        logger.info("Data Found for accountID : " + accID +" sortcode : "+sc +" accountHolderName : "+ accholdername);
       res.end(JSON.stringify({"Account":resultObject} || {}, null, 2));
  }
  else
  {res.statusCode=404;
      logger.error("No Data Found");
    console.log("No Data Found");
 resultObject={"ErrorCode":"BUS01","ErrorReason":"No Matching Data Found in Backend"};
  res.end(JSON.stringify(resultObject || {}, null, 2));
}
 });

 }
  else {
    res.end();
  }

}
