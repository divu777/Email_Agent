import { CheckCircle, MapPin, Edit2, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import Navbar from './Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
        <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image and Profile Photo */}
          <div className="relative">
            <div className="w-full h-48 md:h-60 bg-gray-200 overflow-hidden">
              <img 
                src="https://s.yimg.com/ny/api/res/1.2/3GDtFgblRsytwUZRl6iJsA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTM2MA--/https://media.zenfs.com/en/cover_media_309/acdbe17f94a82269509bf11eb6eec820"
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white absolute -bottom-16 left-8 z-10">
                <img
                  src="https://res.cloudinary.com/dwrqohfya/image/upload/v1747340548/9hq78q_onsw0i.gif"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="pt-20 px-8 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Divakar Jaiswal</h1>
                  <CheckCircle size={20} className="text-blue-600 fill-blue-600" />
                  <button className="ml-auto md:hidden bg-transparent hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <Edit2 size={20} className="text-gray-600" />
                  </button>
                </div>
                
                <p className="text-gray-500">he/him</p>
                
                <p className="text-gray-800 mt-1 text-md">
                  Full Stack Developer | MERN | PostgreSQL | Prisma | Hono | Redis | TypeScript | AWS | Docker | REST APIs
                </p>
                
                <div className="flex items-center mt-2 text-gray-500">
                  <MapPin size={16} className="mr-1" />
                  <span>Jaat , Haryana </span>
                  <button className="ml-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Contact info
                  </button>
                </div>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <img 
                      src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                      alt="Tech University"
                      className="w-7 h-7 rounded"
                    />
                    <span className="ml-2">Tech University</span>
                  </div>
                </div>
                
                <p className="text-blue-600 font-medium mt-2">
                  500+ connections
                </p>
                
                {/* Social Icons */}
                <div className="flex space-x-3 mt-2">
                  <a 
                    href="https://github.com/divu777" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:bg-gray-200 p-2 rounded-full transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={20} className="text-gray-700" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/divakar-jaiswal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:bg-gray-200 p-2 rounded-full transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} className="text-gray-700" />
                  </a>
                  <a 
                    href="https://twitter.com/@chota_don" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:bg-gray-200 p-2 rounded-full transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} className="text-gray-700" />
                  </a>
                  <a 
                    href="https://mailmind.divakar10x.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:bg-gray-200 p-2 rounded-full transition-colors"
                    aria-label="Website"
                  >
                    <Globe size={20} className="text-gray-700" />
                  </a>
                </div>
              </div>
              
              <button className="hidden md:block bg-transparent hover:bg-gray-100 p-2 rounded-full transition-colors">
                <Edit2 size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Profile Buttons */}
          <div className="flex flex-wrap gap-2 px-8 py-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full font-medium transition-colors">
              Open to Career Advice
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-1 rounded-full font-medium transition-colors">
              Add Happy section
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-1 rounded-full font-medium transition-colors">
              Enhance Life
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-1 rounded-full font-medium transition-colors">
              Resources aka money needed
            </button>
          </div>
          
          {/* About Section */}
          <div className="px-8 py-6">
            <div className="bg-white rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">
                Passionate developer with expertise in building scalable web applications. I love solving complex problems and creating elegant solutions. With a strong foundation in both frontend and backend technologies, I specialize in creating robust, user-friendly applications that deliver exceptional value to users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;