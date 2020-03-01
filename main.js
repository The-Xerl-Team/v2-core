global.fs = require("fs");
global.socketEval = require('socket.io-client')("https://xerleval-xerl-miceve.cloud.okteto.net/")
global.jimp = require('jimp');
global.sharp=require("sharp")
const cfg=require("config.json")
global.request = require("request")


      global.wfs = require('webdav-fs')(
        cfg.davhost, {
    username: cfg.davuser,
    password: cfg.davpass
  }
)
let blacklist=["548899664544399383","588011221677113354"]
global.makeid = function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
global.session=makeid(10)
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)]
}
Math.rand = function(min, max) {
  return Math.round(min + (Math.random() * max))
}
let p = "-"

let mongoCli = require("mongodb").MongoClient;
let mongo = new mongoCli(cfg.mongourl, { useUnifiedTopology: true,useNewUrlParser: true });
mongo.connect((err,dbhost)=>{
  if(err){
    return console.log(err);
  }
  global.db=dbhost.db("xerl")

})
global.Discord = require("discord.js")
const ytdl = require('ytdl-core');

const client = new Discord.Client({ ws: { properties: { $os: 'android', $browser: 'mobile', $device: 'mobile' } } })
if(process.env.DEBUG){
  client.login(cfg.debugtoken)
}else{
  client.login(cfg.productiontoken)
}
client.on("ready", () => {
  global.client=client
  let statuses = ["$commands", "My prefix is $", "Users", "Youtube", "in the future"]

  setInterval(() => {
    client.user.setActivity(statuses.random(), {
      "type": "WATCHING"
    })

  }, 30000)
  client.user.setActivity(statuses[0], {
    "type": "WATCHING"
  })

})
function processMessage(message) {
  if(message.attachments.first()){
    if(message.author.id==client.user.id){return}
    //console.log(message.attachments)
    let attachments=[]
    message.attachments.array().forEach(attachment=>{
      if(!attachment.width){return}
      attachments.push(attachment.url)
    })
    if(attachments.length<1){return}
    client.channels.get("678308084661092365").send({files:attachments})
  }
if(message.author.bot||!message.guild){return}
db.collection("prefixes").findOne({guild:message.guild.id},(err,doc)=>{
  if(doc==null){
    db.collection("prefixes").insertOne({guild:message.guild.id,prefix:cfg.defaultprefix})
  }else{
    let p=doc.prefix
    if (message.content.startsWith(p)) {
      message.content = message.content.split("\n").join(" \n")
      try {
        let cmd = message.content.split(" ")[0].split(p);
        cmd.splice(0, 1);
        cmd = cmd.join(p);
        let args = message.content.split(" ");
        args.splice(0, 1);
        if (fs.existsSync(__dirname + "/commands/" + cmd + ".js")) {
          db.collection("profile").findOne({id:message.author.id},(err,profile)=>{
            if(profile==null){
              db.collection("profile").insertOne({id:message.author.id,army:{},humans:{human:5},lastTribute:0,money:0})
              profile={id:message.author.id,army:{},humans:{human:5},lastTribute:0,money:0}
            }
            message.channel.sendEm=(text,opts)=>{
              message.channel.stopTyping()
              return message.channel.send(new Discord.RichEmbed()
                      .setFooter("©️ MiceVersionX 2018-2020")
                      .setColor("RANDOM")
                      .setDescription(text)
                      .setAuthor("Reply to "+message.author.tag+"'s command",message.author.avatarURL)
                  ,opts)
            }
            message.channel.startTyping()
            //  if(require.cache[require.resolve(__dirname+"/commands/"+cmd+".js")]){
            delete require.cache[require.resolve(__dirname + "/commands/" + cmd + ".js")]
            setTimeout(()=>{message.channel.stopTyping()},3000)
            require(__dirname + "/commands/" + cmd + ".js")(args, message,profile)

          })

        }
      } catch (e) {
        return console.error(e)
      }
    }
  }
})

}
client.on("message",processMessage)
client.on("messageUpdate",(o,n)=>{processMessage(n)})
client.on("ready",()=>{console.log("ready")})
