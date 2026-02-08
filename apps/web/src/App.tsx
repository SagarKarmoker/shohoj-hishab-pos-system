import { useState, useEffect } from 'react'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Input } from './components/Input'
import { Toggle } from './components/Toggle'
import { Icon } from './components/Icon'
import { Navbar } from './components/Navbar'

function App() {
  const [isDark, setIsDark] = useState(false)
  const [liveOrders, setLiveOrders] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16">
          <h1 className="text-4xl font-extrabold mb-4">Shohoj Hishab</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Modern accounting solution built with Vite + React + NestJS. Simple, intuitive, and powerful.
          </p>
        </header>

        <div className="space-y-24">
          {/* Color Palette Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Icon name="palette" className="text-primary" />
              <h2 className="text-2xl font-bold">Color Palette</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-primary shadow-lg shadow-orange-500/20 flex items-end p-4">
                  <span className="text-white font-semibold">Primary</span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">#F97316</p>
              </div>
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-slate-900 dark:bg-slate-100 shadow-lg flex items-end p-4">
                  <span className="text-white dark:text-slate-900 font-semibold">Neutral</span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">#0F172A</p>
              </div>
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-success shadow-lg shadow-green-500/20 flex items-end p-4">
                  <span className="text-white font-semibold">Success</span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">#22C55E</p>
              </div>
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-warning shadow-lg shadow-yellow-500/20 flex items-end p-4">
                  <span className="text-white font-semibold">Warning</span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">#FACC15</p>
              </div>
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-error shadow-lg shadow-red-500/20 flex items-end p-4">
                  <span className="text-white font-semibold">Error</span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">#EF4444</p>
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Icon name="text_fields" className="text-primary" />
              <h2 className="text-2xl font-bold">Typography</h2>
            </div>
            <Card className="p-10 space-y-8">
              <div>
                <p className="text-sm text-slate-400 mb-4 font-mono">Heading 1 - Bold 36px</p>
                <h1 className="text-[36px] font-bold">The Quick Brown Fox Jumps Over The Lazy Dog</h1>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-4 font-mono">Heading 2 - Bold 24px</p>
                <h2 className="text-[24px] font-bold">Manage your business with precision.</h2>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-4 font-mono">Body Regular - 16px</p>
                <p className="text-[16px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Effortlessly track expenses, manage accounts, and gain insights into your business's financial performance with our intuitive dashboard designed for speed and clarity.
                </p>
              </div>
            </Card>
          </section>

          {/* Component Library Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Icon name="extension" className="text-primary" />
              <h2 className="text-2xl font-bold">Component Library</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-lg font-semibold mb-6">Buttons & Toggles</h3>
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary Action</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                  <div className="flex items-center gap-8">
                    <Toggle 
                      checked={liveOrders} 
                      onChange={setLiveOrders}
                      label="Live Orders"
                    />
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                      <button className="px-4 py-1.5 bg-white dark:bg-slate-600 rounded-lg shadow-sm text-sm font-medium">Grid</button>
                      <button className="px-4 py-1.5 text-sm font-medium text-slate-500">List</button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-lg font-semibold mb-6">Form Elements</h3>
                <div className="space-y-4">
                  <Input 
                    icon="search"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary">
                      <option>Select Category</option>
                      <option>Main Course</option>
                      <option>Beverages</option>
                    </select>
                    <div className="flex items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <Icon name="calendar_today" className="text-slate-400 mr-2 text-sm" />
                      <span className="text-sm">Today, Oct 24</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Iconography Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Icon name="grid_view" className="text-primary" />
              <h2 className="text-2xl font-bold">Iconography</h2>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {['restaurant', 'local_bar', 'receipt_long', 'table_restaurant', 'inventory', 'person', 'settings', 'notifications', 'monitoring', 'payments'].map((iconName) => (
                <div key={iconName} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary transition-colors cursor-pointer group">
                  <Icon name={iconName} className="text-slate-600 dark:text-slate-400 group-hover:text-primary" />
                  <span className="text-[10px] font-mono text-slate-400 capitalize">{iconName.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Card Samples Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Icon name="dashboard" className="text-primary" />
              <h2 className="text-2xl font-bold">Card UI Samples</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Order Card */}
              <Card className="p-6" shadow="xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-lg">Order #002</h4>
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full font-medium">Preparing</span>
                  </div>
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-slate-100 dark:text-slate-700" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                      <circle className="text-primary" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeDasharray="150.7" strokeDashoffset="30.1" strokeWidth="4"></circle>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">08:12</span>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Icon name="chair" className="text-sm" />
                    <span>Table 12 • 4 Guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Icon name="schedule" className="text-sm" />
                    <span>Ordered 8 mins ago</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Grilled Salmon x 2</span>
                    <span className="font-semibold">$48.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Classic Martini x 1</span>
                    <span className="font-semibold">$12.00</span>
                  </div>
                </div>
                <Button className="w-full mt-6">Mark Ready</Button>
              </Card>

              {/* Stats Card */}
              <Card className="p-6" shadow="xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Icon name="trending_up" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Total Revenue</p>
                    <h4 className="text-2xl font-extrabold">$12,484.00</h4>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Daily Goal</span>
                      <span className="font-bold">84%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-success font-bold">
                    <Icon name="arrow_upward" className="text-sm" />
                    <span>12% from yesterday</span>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-[10px] text-slate-400 mb-1">Orders</p>
                    <p className="text-sm font-bold">142</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-[10px] text-slate-400 mb-1">Avg Check</p>
                    <p className="text-sm font-bold">$32.50</p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions Card */}
              <Card className="p-6" shadow="xl">
                <h4 className="font-bold text-lg mb-6">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name="add" className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">New Order</p>
                      <p className="text-xs text-slate-500">Create a new order</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon name="receipt" className="text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">View Reports</p>
                      <p className="text-xs text-slate-500">Check daily reports</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Icon name="inventory" className="text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Inventory</p>
                      <p className="text-xs text-slate-500">Manage stock</p>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-32 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Icon name="restaurant" className="text-white text-[14px]" />
            </div>
            <span className="font-bold tracking-tight text-slate-500">Shohoj Hishab Design System</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Components</a>
            <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Changelog</a>
          </div>
          <p className="text-sm text-slate-400">© 2024 Shohoj Hishab</p>
        </div>
      </footer>
    </div>
  )
}

export default App