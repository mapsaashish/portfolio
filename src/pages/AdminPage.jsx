import {useEffect,useMemo,useState} from "react";
import {supabase} from "../lib/supabase";
import {deleteItem,deleteMedia,ensurePortfolioBucket,fieldConfig,getAdminContent,removeStorageFile,saveItem,saveItemOrder,saveMediaMeta,saveSettings,sectionLabels,uploadMedia,uploadProfileAsset} from "../lib/content";
const sections=Object.keys(sectionLabels),photoSections=new Set(["current_roles","experience","education","projects","research"]);
function Login({done}){const[create,setCreate]=useState(false),[pw,setPw]=useState(""),[pw2,setPw2]=useState(""),[msg,setMsg]=useState("");async function submit(e){e.preventDefault();setMsg("");try{if(create){if(pw.length<8)throw new Error("Use at least 8 characters.");if(pw!==pw2)throw new Error("Passwords do not match.");const r=await supabase.auth.signUp({email:"mapsaashish@gmail.com",password:pw,options:{emailRedirectTo:window.location.origin+"/portfolio/?admin=1"}});if(r.error)throw r.error;if(!r.data.session){setMsg("Account created. Confirm the email sent to mapsaashish@gmail.com, then sign in.");setCreate(false);return}}else{const r=await supabase.auth.signInWithPassword({email:"mapsaashish@gmail.com",password:pw});if(r.error)throw r.error}await ensurePortfolioBucket();done()}catch(e){setMsg(e.message)}}return <main className="admin-login"><form onSubmit={submit}><div className="brand-mark">AS</div><h1>{create?"Create portfolio admin":"Portfolio Admin"}</h1><p>Manage your CV, projects, experience photos, and public gallery.</p><label>Email<input value="mapsaashish@gmail.com" readOnly/></label><label>Password<input type="password" value={pw} onChange={e=>setPw(e.target.value)} required/></label>{create&&<label>Confirm password<input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} required/></label>}{msg&&<div className="notice">{msg}</div>}<button className="btn primary">{create?"Create admin account":"Sign in"}</button><button type="button" className="text-button" onClick={()=>setCreate(!create)}>{create?"I already have an account":"First time? Create admin account"}</button></form></main>}
function MediaManager({contentId=null,media,setMedia,gallery=false}){const[file,setFile]=useState(null),[form,setForm]=useState({title:"",caption:"",alt_text:"",location:"",taken_at:"",show_in_gallery:gallery,is_cover:false,published:true}),[msg,setMsg]=useState("");const relevant=gallery?media.filter(m=>m.show_in_gallery):media.filter(m=>m.content_id===contentId);async function send(e){e.preventDefault();try{const x=await uploadMedia(file,{...form,content_id:gallery?null:contentId,show_in_gallery:gallery||form.show_in_gallery});setMedia([...media,x]);setFile(null);setMsg("Photo uploaded.")}catch(e){setMsg(e.message)}}async function patch(x,c){if(c.is_cover&&x.content_id)await supabase.from("media_items").update({is_cover:false}).eq("content_id",x.content_id);const y=await saveMediaMeta(x.id,c);setMedia(media.map(m=>m.id===x.id?y:(c.is_cover&&m.content_id===x.content_id?{...m,is_cover:false}:m)));}async function remove(x){if(!confirm("Delete this photo permanently?"))return;await deleteMedia(x);setMedia(media.filter(m=>m.id!==x.id))}return <div className="media-manager"><h3>{gallery?"Photo Gallery":"Experience sharing photos"}</h3><p>{gallery?"Upload standalone fieldwork, research, conference, UAV, map, and professional photos.":"Attach photos to this item, select a cover image, and optionally feature them in the main gallery."}</p><form className="media-form" onSubmit={send}><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>setFile(e.target.files?.[0]||null)}/><input placeholder="Photo title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input type="date" value={form.taken_at} onChange={e=>setForm({...form,taken_at:e.target.value})}/><input placeholder="Alt text" value={form.alt_text} onChange={e=>setForm({...form,alt_text:e.target.value})}/><textarea placeholder="Caption: what was happening and why it mattered" value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})}/>{!gallery&&<><label><input type="checkbox" checked={form.is_cover} onChange={e=>setForm({...form,is_cover:e.target.checked})}/> Use as cover image</label><label><input type="checkbox" checked={form.show_in_gallery} onChange={e=>setForm({...form,show_in_gallery:e.target.checked})}/> Also show in Photo Gallery</label></>}<button className="btn primary">Upload photo</button></form>{msg&&<small>{msg}</small>}<div className="admin-media-grid">{relevant.map(x=><article key={x.id}><img src={x.public_url}/><b>{x.title||"Untitled photo"}</b><small>{x.caption}</small><div>{!gallery&&!x.is_cover&&<button onClick={()=>patch(x,{is_cover:true})}>Set cover</button>}{!gallery&&<button onClick={()=>patch(x,{show_in_gallery:!x.show_in_gallery})}>{x.show_in_gallery?"Remove gallery":"Add gallery"}</button>}<button onClick={()=>remove(x)}>Delete</button></div></article>)}</div></div>}
function Editor({item,section,media,setMedia,onClose,onSaved}){const[data,setData]=useState(item?.data||{}),[published,setPublished]=useState(item?.published??true),[order,setOrder]=useState(item?.sort_order??0),[id,setId]=useState(item?.id||null),[msg,setMsg]=useState("");async function submit(e){e.preventDefault();try{const x=await saveItem({id,section,data,published,sort_order:order});setId(x.id);onSaved(x);setMsg("Saved.")}catch(e){setMsg(e.message)}}return <div className="modal"><div className="editor"><button className="modal-x" onClick={onClose}>×</button><h2>{id?"Edit":"Add"} {sectionLabels[section]}</h2><form onSubmit={submit} className="editor-fields">{fieldConfig[section].map(([k,label,type])=><label key={k}>{label}{type==="textarea"?<textarea value={data[k]||""} onChange={e=>setData({...data,[k]:e.target.value})}/>:type==="list"?<textarea value={Array.isArray(data[k])?data[k].join("\n"):""} onChange={e=>setData({...data,[k]:e.target.value.split("\n").map(x=>x.trim()).filter(Boolean)})}/>:<input value={data[k]||""} onChange={e=>setData({...data,[k]:e.target.value})}/>}</label>)}<label>Display order<input type="number" value={order} onChange={e=>setOrder(e.target.value)}/></label><label className="check"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/> Published</label><button className="btn primary">Save</button></form>{msg&&<small>{msg}</small>}{id&&photoSections.has(section)&&<MediaManager contentId={id} media={media} setMedia={setMedia}/>}</div></div>}
function Profile({settings,onSaved}){
 const fields=[
  ["name","Name"],["headline","Headline"],["location","Location"],["email","Email"],
  ["intro","Introduction"],["cv_url","CV URL"],["linkedin_url","LinkedIn URL"],["github_url","GitHub URL"],
  ["contact_heading","Contact heading"],["contact_text","Contact text"]
 ];
 const[f,setF]=useState(settings||{}),[assetMsg,setAssetMsg]=useState("");
 useEffect(()=>setF(settings||{}),[settings]);
 const visible=key=>f.profile_visibility?.[key]!==false;
 function toggle(key){setF({...f,profile_visibility:{...(f.profile_visibility||{}),[key]:!visible(key)}})}
 async function submit(e){e.preventDefault();try{const x=await saveSettings(f);setF(x);onSaved(x)}catch(e){alert(e.message)}}
 async function uploadAsset(file,kind){
  if(!file)return;
  setAssetMsg("Uploading "+kind+" image…");
  try{
   const oldPath=kind==="profile"?f.profile_image_path:f.cover_image_path;
   const asset=await uploadProfileAsset(file,kind);
   const next={...f,
    [kind+"_image_url"]:asset.publicUrl,
    [kind+"_image_path"]:asset.path,
    profile_visibility:{...(f.profile_visibility||{}),[kind+"_image"]:true}
   };
   const saved=await saveSettings(next);
   setF(saved);onSaved(saved);
   if(oldPath&&oldPath!==asset.path){try{await removeStorageFile(oldPath)}catch{}}
   setAssetMsg((kind==="profile"?"Profile photo":"Cover photo")+" uploaded and published.");
  }catch(e){setAssetMsg(e.message)}
 }
 async function removeAsset(kind){
  if(!confirm("Remove this "+kind+" image from the portfolio?"))return;
  setAssetMsg("Removing image…");
  try{
   const oldPath=kind==="profile"?f.profile_image_path:f.cover_image_path;
   const next={...f,[kind+"_image_url"]:null,[kind+"_image_path"]:null};
   const saved=await saveSettings(next);
   if(oldPath)await removeStorageFile(oldPath);
   setF(saved);onSaved(saved);setAssetMsg("Image removed.");
  }catch(e){setAssetMsg(e.message)}
 }
 return <form className="profile-form" onSubmit={submit}>
  <div className="profile-visibility-note"><b>Public profile visibility</b><span>Keep information saved in the CMS while choosing exactly what visitors can see.</span></div>

  <div className="profile-assets">
   <div className="profile-asset-card">
    <div className="profile-field-head"><span>Profile Photo</span><label className="visibility-toggle"><input type="checkbox" checked={visible("profile_image")} onChange={()=>toggle("profile_image")}/><span>{visible("profile_image")?"Shown":"Hidden"}</span></label></div>
    <div className="asset-preview profile-preview">{f.profile_image_url?<img src={f.profile_image_url} alt="Current profile"/>:<span>AS</span>}</div>
    <p>Square portrait recommended. It will appear in the academic profile area.</p>
    <div className="asset-actions"><label className="btn secondary">Upload / Replace<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>uploadAsset(e.target.files?.[0],"profile")}/></label>{f.profile_image_url&&<button type="button" className="text-button danger" onClick={()=>removeAsset("profile")}>Remove</button>}</div>
   </div>
   <div className="profile-asset-card">
    <div className="profile-field-head"><span>Cover Photo</span><label className="visibility-toggle"><input type="checkbox" checked={visible("cover_image")} onChange={()=>toggle("cover_image")}/><span>{visible("cover_image")?"Shown":"Hidden"}</span></label></div>
    <div className="asset-preview cover-preview">{f.cover_image_url?<img src={f.cover_image_url} alt="Current cover"/>:<span>Wide research, fieldwork, UAV, LiDAR, or campus image</span>}</div>
    <p>Wide landscape image recommended. It will appear above your portfolio introduction.</p>
    <div className="asset-actions"><label className="btn secondary">Upload / Replace<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>uploadAsset(e.target.files?.[0],"cover")}/></label>{f.cover_image_url&&<button type="button" className="text-button danger" onClick={()=>removeAsset("cover")}>Remove</button>}</div>
   </div>
  </div>
  {assetMsg&&<div className="asset-message">{assetMsg}</div>}

  {fields.map(([k,label])=><div className={"profile-field "+(!visible(k)?"profile-field-hidden":"")} key={k}>
   <div className="profile-field-head"><span>{label}</span><label className="visibility-toggle"><input type="checkbox" checked={visible(k)} onChange={()=>toggle(k)}/><span>{visible(k)?"Shown":"Hidden"}</span></label></div>
   {["intro","contact_text"].includes(k)?<textarea value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})}/>:<input value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})}/>}
  </div>)}
  <button className="btn primary">Save profile & visibility</button>
 </form>
}
export default function AdminPage(){
 const[session,setSession]=useState(null),[checking,setChecking]=useState(true),[items,setItems]=useState([]),[media,setMedia]=useState([]),[settings,setSettings]=useState(null),[section,setSection]=useState("experience"),[editor,setEditor]=useState(null),[error,setError]=useState(""),[dragId,setDragId]=useState(null),[orderMsg,setOrderMsg]=useState("");
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setChecking(false)});const{data:l}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));return()=>l.subscription.unsubscribe()},[]);
 async function load(){try{await ensurePortfolioBucket();const d=await getAdminContent();setItems(d.items);setMedia(d.media);setSettings(d.settings)}catch(e){setError(e.message)}}
 useEffect(()=>{if(session)load()},[session]);
 const visible=useMemo(()=>items.filter(x=>x.section===section).sort((a,b)=>(a.sort_order??0)-(b.sort_order??0)),[items,section]);
 function saved(x){setItems(a=>a.some(y=>y.id===x.id)?a.map(y=>y.id===x.id?x:y):[...a,x])}
 async function remove(x){if(!confirm("Delete "+(x.data?.title||x.data?.degree||"this item")+"?"))return;await deleteItem(x.id);setItems(items.filter(y=>y.id!==x.id));setMedia(media.filter(m=>m.content_id!==x.id))}
 async function persistSkillOrder(next){
  const ordered=next.map((x,index)=>({...x,sort_order:(index+1)*10}));
  setItems(current=>current.map(item=>ordered.find(x=>x.id===item.id)||item));
  setOrderMsg("Saving order…");
  try{await saveItemOrder(ordered);setOrderMsg("Skill order saved.");}
  catch(e){setOrderMsg("Could not save order: "+e.message);await load();}
 }
 function dropSkill(targetId){
  if(section!=="skills"||!dragId||dragId===targetId){setDragId(null);return}
  const next=[...visible],from=next.findIndex(x=>x.id===dragId),to=next.findIndex(x=>x.id===targetId);
  if(from<0||to<0){setDragId(null);return}
  const[moved]=next.splice(from,1);next.splice(to,0,moved);setDragId(null);persistSkillOrder(next);
 }
 function moveSkill(id,direction){
  const next=[...visible],from=next.findIndex(x=>x.id===id),to=from+direction;
  if(from<0||to<0||to>=next.length)return;
  [next[from],next[to]]=[next[to],next[from]];persistSkillOrder(next);
 }
 if(checking)return <main className="center-screen">Loading…</main>;
 if(!session)return <Login done={()=>supabase.auth.getSession().then(({data})=>setSession(data.session))}/>;
 return <div className="admin-shell">
  <aside className="admin-sidebar">
   <div className="brand-mark">AS</div><h3>Portfolio CMS</h3>
   <button onClick={()=>setSection("profile")}>Profile & Contact</button>
   {sections.map(s=><button key={s} className={section===s?"active":""} onClick={()=>{setSection(s);setOrderMsg("")}}>{sectionLabels[s]} <span>{items.filter(i=>i.section===s).length}</span></button>)}
   <button onClick={()=>setSection("gallery")}>Photo Gallery <span>{media.filter(m=>m.show_in_gallery).length}</span></button>
   <a href="./">View portfolio</a><button onClick={()=>supabase.auth.signOut()}>Sign out</button>
  </aside>
  <main className="admin-main">
   <header className="admin-head">
    <div><small>CONTENT MANAGEMENT</small><h1>{section==="profile"?"Profile & Contact":section==="gallery"?"Photo Gallery":sectionLabels[section]}</h1></div>
    {!["profile","gallery"].includes(section)&&<button className="btn primary" onClick={()=>setEditor({section})}>+ Add item</button>}
   </header>
   {error&&<div className="notice">{error}</div>}
   {section==="skills"&&<div className="sort-help"><b>Arrange skills</b><span>Drag skill categories into the order you want. You can also use ↑ and ↓. Changes save automatically.</span>{orderMsg&&<small>{orderMsg}</small>}</div>}
   {section==="profile"?<Profile settings={settings} onSaved={setSettings}/>:
    section==="gallery"?<MediaManager media={media} setMedia={setMedia} gallery/>:
    <div className="admin-list">
     {visible.map((x,index)=><article
      key={x.id}
      className={section==="skills"?"skill-sortable"+(dragId===x.id?" dragging":""):""}
      draggable={section==="skills"}
      onDragStart={()=>section==="skills"&&setDragId(x.id)}
      onDragEnd={()=>setDragId(null)}
      onDragOver={e=>section==="skills"&&e.preventDefault()}
      onDrop={e=>{e.preventDefault();dropSkill(x.id)}}
     >
      <div className="admin-item-title">
       {section==="skills"&&<span className="drag-handle" title="Drag to reorder">⋮⋮</span>}
       <span><b>{x.data?.title||x.data?.degree||"Untitled"}</b><small>{x.data?.organization||x.data?.institution||x.data?.issuer||""}</small></span>
      </div>
      {photoSections.has(section)&&<span>{media.filter(m=>m.content_id===x.id).length} photos</span>}
      <span>{x.published?"Published":"Draft"}</span>
      {section==="skills"&&<div className="order-buttons"><button disabled={index===0} onClick={()=>moveSkill(x.id,-1)} title="Move up">↑</button><button disabled={index===visible.length-1} onClick={()=>moveSkill(x.id,1)} title="Move down">↓</button></div>}
      <button onClick={()=>setEditor({section,item:x})}>Edit</button>
      <button onClick={()=>remove(x)}>Delete</button>
     </article>)}
    </div>}
  </main>
  {editor&&<Editor {...editor} media={media} setMedia={setMedia} onClose={()=>setEditor(null)} onSaved={saved}/>}
 </div>
}