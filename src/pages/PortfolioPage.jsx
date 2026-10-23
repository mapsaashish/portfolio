import {useEffect,useMemo,useState} from "react";
import {getPublicContent,sectionLabels} from "../lib/content";
import ContentCard from "../components/ContentCard";
import Lightbox from "../components/Lightbox";
import SectionHeading from "../components/SectionHeading";

const order=["current_roles","projects","research","experience","education","publications","certifications","training","awards"];

export default function PortfolioPage(){
 const[p,setP]=useState({settings:null,items:[],media:[]}),[loading,setLoading]=useState(true),[error,setError]=useState(""),[viewer,setViewer]=useState(null);
 useEffect(()=>{getPublicContent().then(setP).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const groups=useMemo(()=>{const g={};p.items.forEach(i=>(g[i.section]??=[]).push(i));return g},[p.items]);
 if(loading)return <main className="center-screen">Loading portfolio…</main>;
 if(error)return <main className="center-screen">{error}</main>;

 const s=p.settings||{};
 const gallery=p.media.filter(m=>m.show_in_gallery&&m.published);
 const open=(items,index=0)=>setViewer({items,index});
 const gridClass=sec=>sec==="experience"||sec==="education"||sec==="current_roles"?"grid one":sec==="projects"?"grid two":"grid two";

 return <div className="site-shell">
  <nav className="topnav">
   <a className="brand" href="#top"><span>AS</span><div><b>{s.name||"Aashish Sharma"}</b><small>Geospatial Researcher</small></div></a>
   <div className="navlinks">
    <a href="#projects">Projects</a>
    <a href="#research">Research</a>
    <a href="#experience">Experience</a>
    {gallery.length>0&&<a href="#gallery">Gallery</a>}
    <a href="#contact">Contact</a>
   </div>
  </nav>

  <main id="top" className="public-main">
   <section className="hero">
    <div className="hero-copy">
     <div className="eyebrow">GEOMATICS · GIS · REMOTE SENSING</div>
     <h1>{s.name||"Aashish Sharma"}</h1>
     <h2>{s.headline||"Geomatics Engineer · Graduate Research Assistant · M.S. Civil Engineering"}</h2>
     <p>{s.intro}</p>
     <div className="hero-actions">
      <a className="btn primary" href="#projects">View selected work</a>
      {s.email&&<a className="btn secondary" href={"mailto:"+s.email}>Email</a>}
      {s.github_url&&<a className="btn secondary" href={s.github_url} target="_blank" rel="noreferrer">GitHub</a>}
     </div>
    </div>
    <aside className="academic-profile">
     <div className="profile-monogram">AS</div>
     <div>
      <span>Current focus</span>
      <b>Photogrammetry, LiDAR & UAV Mapping</b>
     </div>
     <div>
      <span>Affiliation</span>
      <b>Florida Atlantic University</b>
     </div>
     <div>
      <span>Based in</span>
      <b>{s.location||"Boca Raton, Florida"}</b>
     </div>
    </aside>
   </section>

   {order.map(sec=>groups[sec]?.length>0&&
    <section id={sec} key={sec} className={"content-section section-"+sec}>
     <SectionHeading
      kicker={sectionLabels[sec]}
      title={sec==="projects"?"Selected Projects":sec==="research"?"Research Interests":sec==="experience"?"Professional Experience":sectionLabels[sec]}
      text={sec==="projects"?"Selected research and applied geospatial work.":sec==="research"?"Current and emerging areas of academic and technical interest.":sec==="experience"?"Professional work across research, international development, disaster risk reduction, and geospatial consulting.":undefined}
     />
     <div className={gridClass(sec)}>
      {groups[sec].map(i=><ContentCard key={i.id} item={i} media={p.media} onOpenMedia={open}/>)}
     </div>
    </section>
   )}

   {gallery.length>0&&
    <section id="gallery" className="content-section gallery-section">
     <SectionHeading kicker="Photo gallery" title="Fieldwork & Professional Moments" text="Selected photographs from research, field activities, mapping projects, conferences, training, and professional work."/>
     <div className="photo-gallery">
      {gallery.map((m,i)=><button key={m.id} onClick={()=>open(gallery,i)}>
       <img src={m.public_url} alt={m.alt_text||m.title||"Portfolio gallery photo"}/>
       <span>{m.title&&<b>{m.title}</b>}<small>{[m.location,m.taken_at].filter(Boolean).join(" · ")}</small></span>
      </button>)}
     </div>
    </section>
   }

   {groups.skills?.length>0&&
    <section id="skills" className="content-section skills-section">
     <SectionHeading kicker="Technical toolkit" title="Skills & Methods"/>
     <div className="grid two">
      {groups.skills.map(i=><ContentCard key={i.id} item={i} media={[]} onOpenMedia={open}/>)}
     </div>
    </section>
   }

   <section id="contact" className="contact">
    <div>
     <div className="eyebrow">CONTACT</div>
     <h2>{s.contact_heading||"Let's connect."}</h2>
     <p>{s.contact_text}</p>
    </div>
    <div className="contact-actions">
     {s.email&&<a className="btn primary" href={"mailto:"+s.email}>{s.email}</a>}
     {s.linkedin_url&&<a className="text-link" href={s.linkedin_url} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
    </div>
   </section>
  </main>

  <footer><span>© {new Date().getFullYear()} {s.name||"Aashish Sharma"}</span><span>Geomatics · GIS · Remote Sensing</span><a href="?admin=1">Admin</a></footer>
  {viewer&&<Lightbox items={viewer.items} index={viewer.index} onIndex={index=>setViewer(v=>({...v,index}))} onClose={()=>setViewer(null)}/>}
 </div>
}