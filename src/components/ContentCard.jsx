function TagList({items=[]}){return items.length>0?<div className="tags">{items.filter(Boolean).map((x,i)=><span key={i}>{x}</span>)}</div>:null}

export default function ContentCard({item,media=[],onOpenMedia}){
 const d=item.data||{};
 const pics=media.filter(m=>m.content_id===item.id&&m.published);
 const cover=pics.find(m=>m.is_cover)||pics[0];

 if(item.section==="training"){
  return <article className="training-card">
   <div className="training-mark"><span>PD</span></div>
   <div className="training-content">
    <div className="training-top">
     {d.issuer&&<span className="training-provider">{d.issuer}</span>}
     {d.year&&<time>{d.year}</time>}
    </div>
    <h3>{d.title||"Professional Training"}</h3>
    {d.description&&<p>{d.description}</p>}
   </div>
  </article>
 }

 if(item.section==="experience"){
  return <article className="content-card content-card-experience">
   <div className="experience-card-body">
    <div className="experience-head">
     <div>
      {d.organization&&<b className="experience-org">{d.organization}</b>}
      <h3>{d.title||"Untitled"}</h3>
     </div>
     <div className="experience-meta">
      {d.period&&<span>{d.period}</span>}
      {d.location&&<small>{d.location}</small>}
     </div>
    </div>
    {d.description&&<p className="experience-summary">{d.description}</p>}
    {Array.isArray(d.highlights)&&d.highlights.filter(Boolean).length>0&&<details className="experience-details">
     <summary>Key responsibilities & impact <span>{d.highlights.filter(Boolean).length}</span></summary>
     <ul>{d.highlights.filter(Boolean).map((x,i)=><li key={i}>{x}</li>)}</ul>
    </details>}
    {Array.isArray(d.skills)&&<TagList items={d.skills}/>}
    {pics.length>0&&<div className="experience-photo-strip">{pics.slice(0,4).map((p,i)=><button key={p.id} onClick={()=>onOpenMedia(pics,i)}><img src={p.public_url} alt={p.alt_text||p.title||"Experience photo"}/></button>)}</div>}
   </div>
  </article>
 }

 return <article className={"content-card content-card-"+item.section}>
  {cover&&<button className="card-cover" onClick={()=>onOpenMedia(pics,pics.indexOf(cover))}><img src={cover.public_url} alt={cover.alt_text||d.title||"Portfolio image"}/><span>{pics.length} photo{pics.length!==1?"s":""}</span></button>}
  <div className="content-card-body">
   {d.category&&<span className="mini-label">{d.category}</span>}
   <h3>{d.title||d.degree||"Untitled"}</h3>
   {(d.organization||d.institution||d.issuer||d.venue)&&<b className="card-org">{d.organization||d.institution||d.issuer||d.venue}</b>}
   <small>{[d.period||d.year,d.location].filter(Boolean).join(" · ")}</small>
   {item.section==="publications"&&d.authors&&<p className="publication-authors">{d.authors}</p>}
   {d.description&&<p>{d.description}</p>}
   {item.section==="publications"&&d.link&&<a className="publication-link" href={d.link} target="_blank" rel="noreferrer">View paper ↗</a>}
   {Array.isArray(d.highlights)&&<ul>{d.highlights.filter(Boolean).map((x,i)=><li key={i}>{x}</li>)}</ul>}
   {Array.isArray(d.skills)&&<TagList items={d.skills}/>}
   {Array.isArray(d.coursework)&&<TagList items={d.coursework}/>}
   {pics.length>1&&<div className="card-photo-strip">{pics.slice(0,4).map((p,i)=><button key={p.id} onClick={()=>onOpenMedia(pics,i)}><img src={p.public_url} alt={p.alt_text||p.title||"Experience photo"}/></button>)}</div>}
  </div>
 </article>
}