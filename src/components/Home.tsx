
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Map, ChevronRight, User, ExternalLink, Activity, Key, Wrench, Radio, Signal, Table } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 overflow-x-hidden">
      
      {/* Hero Banner - Compacted */}
      <div className="relative w-full py-8 bg-gradient-to-b from-[#005d8f] to-[#004a73] border-b-4 border-orange-500 shadow-md">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10"></div>
        
        <div className="container mx-auto px-4 flex flex-row items-center justify-center gap-6 relative z-10 animate-enter">
            {/* Indian Railways / S&T Logo */}
            <div className="w-24 h-25 md:w-28 md:h-28 rounded-t-full rounded-b-none bg-white flex items-center justify-center shadow-xl ring-4 ring-white/20 overflow-hidden flex-shrink-0">
                <img 
                    src="https://img-cdn.publive.online/fit-in/1280x960/filters:format(webp)/connect-gujarat-english/media/post_banners/wp-content/uploads/2018/12/Western-Railway-Logo.png" 
                    alt="Indian Railways Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Indian_Railways_logo.svg/1200px-Indian_Railways_logo.svg.png";
                    }}
                />
            </div>
            
            <div className="text-left">
                <h1 className="text-xl md:text-3xl text-white font-bold tracking-wide mb-1 drop-shadow-md leading-tight">
                    Welcome to S&T Department
                </h1>
                <h2 className="text-sm md:text-lg text-orange-400 font-medium tracking-[0.1em] uppercase drop-shadow-sm">
                    Ahmedabad Division
                </h2>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8">
            
            {/* Signal Section */}
            <div className="mb-10 animate-enter delay-100">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
                    <div className="bg-blue-50 p-2 rounded-md text-[#005d8f]">
                        <Signal className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-[#005d8f] text-2xl font-bold uppercase tracking-tight">
                            Signal
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-8">
                    
                    {/* Daily Subsection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-[#005d8f] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm">Daily</div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Position to be filled by section staff</span>
                        </div>
                        <div className="space-y-2">
                            <LinkCard 
                                title="Daily Maintenance Activity Form"
                                href="/report-maintenance"
                                icon={<Wrench className="w-4 h-4 text-amber-600" />}
                                sheetHref="/view-data/maintenance"
                            />
                            <LinkCard 
                                title="Daily Relay Room Opening Form"
                                href="/report-inspection"
                                icon={<Key className="w-4 h-4 text-teal-600" />}
                                sheetHref="/view-data/relay"
                            />
                             <LinkCard 
                                title="Daily movement CSI & SI Form"
                                href="#"
                                icon={<FileText className="w-4 h-4 text-slate-400" />}
                                isExternal
                                sheetHref="#"
                            />
                        </div>
                    </div>

                    {/* Weekly Subsection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm">Weekly</div>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Detailed Report Submission</span>
                        </div>
                        <div className="space-y-2">
                             <LinkCard 
                                title="Weekly Position of Fire Alarm Form"
                                href="/report-failure"
                                icon={<Activity className="w-4 h-4 text-red-600" />}
                                sheetHref="/view-data/failure"
                            />
                             <LinkCard 
                                title="Weekly AC Unit Position Form"
                                href="#"
                                icon={<FileText className="w-4 h-4 text-slate-400" />}
                                isExternal
                                sheetHref="#"
                            />
                             <LinkCard 
                                title="Weekly IPS Position Form"
                                href="/report-ips"
                                icon={<Activity className="w-4 h-4 text-purple-600" />}
                                sheetHref="/view-data/ips"
                            />
                             <LinkCard 
                                title="JPC Done (ADI Div) Form"
                                href="#"
                                icon={<FileText className="w-4 h-4 text-slate-400" />}
                                isExternal
                                sheetHref="#"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Divider */}
            <div className="mb-10 opacity-30">
                <div className="railway-track w-full h-3 bg-size-[20px]"></div>
            </div>

            {/* Section 2: Telecom Links */}
            <div className="mb-10 animate-enter delay-200">
                 <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                    <div className="bg-blue-50 p-2 rounded-md text-[#005d8f]">
                        <Radio className="w-8 h-8" />
                    </div>
                     <div>
                        <h2 className="text-[#005d8f] text-2xl font-bold uppercase tracking-tight">
                            Telecom
                        </h2>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-2 group hover:bg-slate-100 transition-colors cursor-default">
                    <Radio className="w-8 h-8 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    <span className="text-slate-400 font-medium italic text-sm">Telecom reports module coming soon</span>
                </div>
            </div>

             {/* Track Divider */}
             <div className="mb-10 opacity-30">
                <div className="railway-track w-full h-3 bg-size-[20px]"></div>
            </div>

            {/* Section 4: Maps */}
            <div className="mb-4 animate-enter delay-300">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                    <div className="bg-blue-50 p-2 rounded-md text-[#005d8f]">
                        <Map className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-[#005d8f] text-2xl font-bold uppercase tracking-tight">
                            System Maps
                        </h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <LinkCard 
                        title="Divisional Map"
                        href="https://drive.google.com/file/d/10zEoPTh9MUfdaM95zoM8qcYOBR62G_Kz/view?usp=sharing"
                        icon={<Map className="w-5 h-5 text-blue-600" />}
                        isExternal
                    />
                    <LinkCard 
                        title="Jurisdiction Map"
                        href="https://drive.google.com/file/d/12CLXcG4i1U6FHvji4aDXWf4PTmNVbDgl/view?usp=sharing"
                        icon={<Map className="w-5 h-5 text-blue-600" />}
                        isExternal
                    />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const LinkCard = ({ title, href, icon, isExternal, delay, sheetHref }: { title: string, href: string, icon: React.ReactNode, isExternal?: boolean, delay?: string, sheetHref?: string }) => {
    const cardContent = (
        <>
            <div className="flex-shrink-0 p-1.5 bg-slate-50 rounded-full group-hover:bg-white transition-colors border border-slate-100">{icon}</div>
            <div className="flex-grow min-w-0">
                <h3 className="font-bold text-sm leading-tight text-slate-700 group-hover:text-[#005d8f] transition-colors truncate">
                    {title}
                </h3>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#005d8f] group-hover:translate-x-1 transition-all flex-shrink-0" />
        </>
    );

    const baseClasses = `flex items-center gap-3 p-3 rounded-lg border bg-white border-slate-200 hover:border-[#005d8f] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group text-left w-full relative overflow-hidden h-12 ${delay ? `animate-enter ${delay}` : ''}`;
    
    // Wrapper for the main clickable area and the sheet button
    return (
        <div className="flex items-center gap-2">
            {isExternal ? (
                <a 
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClasses} flex-grow`}
                >
                    {cardContent}
                </a>
            ) : (
                <Link to={href} className={`${baseClasses} flex-grow`}>
                    {cardContent}
                </Link>
            )}

            {/* View Sheet Button */}
            {sheetHref && (
                <Link
                    to={sheetHref}
                    target={sheetHref.startsWith('http') ? "_blank" : undefined}
                    className="flex flex-col items-center justify-center h-12 w-14 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex-shrink-0 group/sheet shadow-sm hover:-translate-y-0.5 cursor-pointer"
                    title="View Data Sheet"
                >
                    <Table className="w-5 h-5 text-green-600 mb-0.5 group-hover/sheet:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold text-green-700 uppercase leading-none text-center">View<br/>Sheet</span>
                </Link>
            )}
        </div>
    );
};

export default Home;
