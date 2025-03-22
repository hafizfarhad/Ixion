// Footer component with three columns and improved mobile responsiveness
const Footer = () => {
    // Footer navigation links with more filler options
    const footerNavigation = {
      products: [
        { name: 'Analytics', href: '#' },
        { name: 'Commerce', href: '#' },
        { name: 'Insights', href: '#' },
        { name: 'Marketing', href: '#' },
        { name: 'Automation', href: '#' },
        { name: 'Integration', href: '#' },
      ],
      company: [
        { name: 'About', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Jobs', href: '#' },
        { name: 'Press', href: '#' },
        { name: 'Partners', href: '#' },
        { name: 'Testimonials', href: '#' },
      ],
      resources: [
        { name: 'Documentation', href: '#' },
        { name: 'Guides', href: '#' },
        { name: 'API Status', href: '#' },
        { name: 'Support', href: '#' },
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
      ],
      social: [
        { name: 'Twitter', href: '#', icon: 'X' },
        { name: 'LinkedIn', href: '#', icon: 'in' },
        { name: 'GitHub', href: '#', icon: 'GH' },
        { name: 'Instagram', href: '#', icon: 'IG' },
        { name: 'YouTube', href: '#', icon: 'YT' },
      ],
    }
  
    return (
      <footer className="bg-white mt-auto border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Company info */}
            <div>
              <div className="flex flex-col gap-6">
                <div>
                  <a href="#" className="inline-flex">
                    <span className="sr-only">Your Company</span>
                    <img
                      alt=""
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-8 w-auto"
                    />
                  </a>
                </div>
                <p className="text-sm/6 text-gray-600">
                  Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
                </p>
                {/* Social links */}
                <div>
                  <ul role="list" className="mt-2 flex flex-wrap gap-4">
                    {footerNavigation.social.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="rounded-md bg-gray-50 p-2 text-gray-500 hover:text-gray-900">
                          <span className="sr-only">{item.name}</span>
                          {/* Placeholder for icons - replace with your actual icons */}
                          <span className="text-sm font-medium">{item.icon}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
  
            {/* Navigation links - simplified to 2 columns on mobile, 3 on larger screens */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Products</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.products.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm/6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm/6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerNavigation.resources.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm/6 text-gray-600 hover:text-gray-900">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
  
          {/* Copyright */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-center text-xs/5 text-gray-500">
              &copy; {new Date().getFullYear()} Your Company, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  }
  
  export default Footer;