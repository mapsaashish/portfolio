export default function SectionHeading({kicker,title,text}){
 const showKicker=kicker&&kicker.trim().toLowerCase()!==String(title||"").trim().toLowerCase();
 return <header className="section-heading">{showKicker&&<div className="kicker">{kicker}</div>}<h2>{title}</h2>{text&&<p>{text}</p>}</header>
}