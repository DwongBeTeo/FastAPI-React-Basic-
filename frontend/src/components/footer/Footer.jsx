const Footer = () => {
    return (
        <footer className="border-t py-8 bg-[#031427]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#909097] font-['Inter']">
                <div>© 2026 EquiVista Financial Technologies. All rights reserved.</div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-[#d3e4fe] transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-[#d3e4fe] transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-[#d3e4fe] transition-colors">API Documentation</a>
                    <a href="#" className="hover:text-[#d3e4fe] transition-colors">Contact Support</a>
                </div>
            </div>
        </footer>
    );
};
export default Footer;