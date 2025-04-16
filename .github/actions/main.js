
const core = require('@actions/core') // input and output 
const exec= require('@actions/exec') // uloading to S3



function run(){
// Get inputs

const bucket =core.getInput('bucket', {required:true});
const bucketRegion =core.getInput('bucket-region', {required:true});
const distFolder =core.getInput('dist-folder', {required:true});
//Upload files to S3

const s3URI= `s3://${bucket}`
exec.exec(`aws s3 sync ${distFolder} ${s3URI} --region ${bucketRegion}`)
// `aws s3 sync folder1 s3://dktcohort --region us-east-1`



//Get URl
const websiteUrl= `http://${bucket}.s3-website-${bucketRegion}.amazonaws.com`
// http://jobplex-frontend.s3-website-us-east-1.amazonaws.com
core.setOutput('website-url',websiteUrl)

}

run()