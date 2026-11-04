import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

const AdminPageLayout = ({ title, description, actions, children }) => (
    <>
        <MetaData title={`${title} | Pizzaro`} />
        <div className="pizzaro-admin-shell">
            <Sidebar />
            <main className="pizzaro-admin-main pizzaro-admin-page">
                <header className="pizzaro-dashboard-heading pizzaro-admin-page-heading">
                    <div>
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                    {actions}
                </header>
                {children}
            </main>
        </div>
    </>
)

export default AdminPageLayout
