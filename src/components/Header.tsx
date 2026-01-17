export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png.png" 
              alt="Tabulon Logo" 
              className="h-9 w-auto"
            />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Tabulon
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#formats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Formats
            </a>
            <a href="https://github.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
