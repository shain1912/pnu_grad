const fs = require('fs');
const path = require('path');

const VARIANTS_DIR = path.resolve(__dirname, 'frontend', 'src', 'variants');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. TypeScript syntax removal
  // Remove interface / type declarations
  content = content.replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '');
  content = content.replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '');
  
  // Remove type casts: "as string", "as HTMLElement", "as HTMLVideoElement", etc.
  content = content.replace(/\s+as\s+[A-Za-z0-9_<>|[\]]+/g, '');

  // Remove generic annotations: useRef<HTMLDivElement>(null) -> useRef(null)
  content = content.replace(/useRef<[^>]+>\(/g, 'useRef(');
  content = content.replace(/useState<[^>]+>\(/g, 'useState(');
  content = content.replace(/gsap\.utils\.toArray<[^>]+>\(/g, 'gsap.utils.toArray(');

  // Remove type annotation in function parameters like (path: string), (rootRef: RefObject<HTMLElement | null>), etc.
  // And also parameter type declarations
  content = content.replace(/(\w+):\s*(?:RefObject<[^>]+>|ReactNode|React\.FC|Metadata|string|number|boolean|any|object|FC|(() => void)|HTMLVideoElement|HTMLDivElement|HTMLElement|HTMLElement\s*\|\s*null)/g, '$1');
  
  // Remove non-null assertion: self.selector! -> self.selector
  content = content.replace(/(\w+)\.selector!/g, '$1.selector');
  content = content.replace(/(\w+)!/g, '$1');

  // Remove metadata object declarations for Next.js
  content = content.replace(/export\s+const\s+metadata\s*:\s*Metadata\s*=[\s\S]*?;/g, '');

  // 2. Next.js to React Router conversions
  // next/image -> standard HTML <img>
  content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"];?/g, '');
  content = content.replace(/<Image\s+/g, '<img ');
  
  // next/link -> react-router-dom Link
  content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, 'import { Link } from "react-router-dom";');
  content = content.replace(/<Link\s+([^>]*?)href=/g, '<Link $1to=');

  // next/navigation -> react-router-dom useLocation / useNavigate
  content = content.replace(/import\s+\{\s*usePathname\s*\}\s+from\s+['"]next\/navigation['"];?/g, 'import { useLocation } from "react-router-dom";');
  content = content.replace(/import\s+\{\s*usePathname,\s*useRouter\s*\}\s+from\s+['"]next\/navigation['"];?/g, 'import { useLocation, useNavigate } from "react-router-dom";');
  content = content.replace(/import\s+\{\s*useRouter\s*\}\s+from\s+['"]next\/navigation['"];?/g, 'import { useNavigate } from "react-router-dom";');
  content = content.replace(/const\s+pathname\s*=\s*usePathname\(\);?/g, 'const { pathname } = useLocation();');
  content = content.replace(/const\s+router\s*=\s*useRouter\(\);?/g, 'const navigate = useNavigate();');
  content = content.replace(/router\.push\(/g, 'navigate(');

  // 3. Import path alias fix
  // Replace "@/lib/" with "../../lib/" or "src/lib/" based on alias configs. We'll add resolver in vite.config.js as well, but let's change explicitly here if needed.
  // Actually, we'll configure "@/" alias in Vite config, so we can keep "@/lib/" as is!
  
  // Write back to disk
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Converted: ${filePath}`);
}

function renameFiles(files) {
  files.forEach(file => {
    const ext = path.extname(file);
    let newPath = file;
    if (ext === '.tsx') {
      newPath = file.substring(0, file.length - 4) + '.jsx';
      fs.renameSync(file, newPath);
      console.log(`Renamed: ${file} -> ${newPath}`);
    } else if (ext === '.ts') {
      newPath = file.substring(0, file.length - 3) + '.js';
      fs.renameSync(file, newPath);
      console.log(`Renamed: ${file} -> ${newPath}`);
    }
    convertFile(newPath);
  });
}

if (fs.existsSync(VARIANTS_DIR)) {
  const allFiles = walk(VARIANTS_DIR);
  renameFiles(allFiles);
} else {
  console.error("Variants directory does not exist!");
}
