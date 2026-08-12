import Link from "next/link"
export default function NotFound() { return <div className="empty-state"><div><h1>Page not found.</h1><p>This route does not exist in MemeCap Simulator.</p></div><Link className="btn btn-primary" href="/">Open Simulator</Link></div> }
