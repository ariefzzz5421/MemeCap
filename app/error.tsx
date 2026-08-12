"use client"
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="empty-state"><div><h1>That view could not load.</h1><p>The application hit an unexpected error. Retry the view; saved local data is unchanged.</p></div><button className="btn btn-primary" onClick={reset}>Try Again</button></div> }
