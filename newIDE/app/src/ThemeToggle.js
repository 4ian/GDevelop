import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import './index.css';


const ThemeToggle = () => {
     
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    useEffect(() => {
        if( localStorage.getItem('theme') === 'dark' ){
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
        
    },[])
    const toggleTheme = () => {
        if(isDarkMode){
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        }else{
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    }
    return (
         <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle Theme">
            
            {!isDarkMode ?  (<Sun className="sun-icons"/>) : (<Moon  className="moon-icons"/>)
            }
         </button>
        
    )
};

export default ThemeToggle;