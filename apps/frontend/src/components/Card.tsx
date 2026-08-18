import "../styles.css";

export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (


      <div className={`card ${className}`}>

        {children}
      </div>


  );
}

{/*I cannot for the love of god get this to work at all*/}