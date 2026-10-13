const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const moduleText=fs.readFileSync(path.join(root,'outlast-v439-skill-ui-redesign.js'),'utf8');
new vm.Script(moduleText,{filename:'outlast-v439-skill-ui-redesign.js'});
assert(html.includes('<meta name="outlast-build" content="4.3.9">'),'HTML metadata must advertise v4.3.9');
assert(html.includes("const BUILD='4.3.9',ACK='outlast_update_ack_v4.3.9'"),'mandatory update acknowledgement must target v4.3.9');
const balanceTag=html.indexOf('outlast-v438-upgrade-boss-balance.js?v=4.3.9');
const newTag=html.indexOf('outlast-v439-skill-ui-redesign.js?v=4.3.9');
assert(balanceTag>=0&&newTag>balanceTag,'v4.3.9 behavior and UI patch must load after old UI scripts and balance');
for(const skill of ['Nova','Blink','Fortify','TimeStop','Meteor'])assert(moduleText.includes(skill),'Active skill implementation missing: '+skill);
for(const token of ['function activateSkillV439','function selectSkillV439','function renderSkillsV439','OUTLAST_SKILL_UI_V439','OUTLAST_MENU_REDESIGN_V439','OUTLAST_UPGRADE_CARD_DESIGN_V439','data-action="skill"','outlast-v439-skill-grid','@media (max-width: 760px)']){
 assert(moduleText.includes(token),'Skill/UI redesign contract missing: '+token);
}
assert(moduleText.includes('skillCooldownMult')&&moduleText.includes('stunTimer'),'skill cooldown and real TimeStop behavior must be consumed');
assert(moduleText.includes('updateLog')||moduleText.includes('updates.unshift'),'release notes must be updated');
assert(moduleText.includes('helpArticles'),'player How-To must be updated');
console.log('OUTLAST v4.3.9 skill activation, menu redesign, upgrade cards, and release-note tests passed');
