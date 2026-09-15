import nodemailer from 'nodemailer';
export function createMailTransport(env=process.env){
 if(env.PORTAL_MAIL_ENABLED!=='true')return null;
 const port=Number(env.SMTP_PORT||465);if(![465,587].includes(port)||!env.SMTP_HOST||!env.SMTP_USER||!env.SMTP_PASSWORD||!env.SMTP_FROM)throw Error('SMTP host, port, kullanıcı, şifre ve gönderen eksiksiz yapılandırılmalı');
 const transporter=nodemailer.createTransport({host:env.SMTP_HOST,port,secure:port===465,requireTLS:port===587,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},tls:{minVersion:'TLSv1.2'},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:30000,disableFileAccess:true,disableUrlAccess:true});
 const send=async payload=>{try{const result=await transporter.sendMail({from:env.SMTP_FROM,to:payload.to,cc:payload.cc,subject:payload.subject,text:payload.text,messageId:'<'+payload.idempotencyKey+'@ascendlojistik.com>',attachments:payload.attachment?[{filename:payload.attachment.name,content:Buffer.from(payload.attachment.body),contentType:payload.attachment.mime}]:[]});if(result.rejected?.length){const error=Error('Alıcıların bir kısmı kabul edilmedi');error.deliveryUncertain=true;throw error;}return result;}catch(error){if(error.command==='DATA'||error.code==='ETIMEDOUT')error.deliveryUncertain=true;throw error;}};
 send.close=()=>transporter.close();send.verify=()=>transporter.verify();return send;
}
