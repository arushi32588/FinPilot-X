import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const linkStyle = (path) =>
    `block px-4 py-2 rounded hover:bg-blue-100 ${
      pathname === path ? "bg-blue-200 font-semibold" : ""
    }`;

  return (
    <div className="w-64 bg-white border-r p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4">FinPilot X</h2>
      <nav className="space-y-2">
        <Link to="/" className={linkStyle("/")}>Home</Link>
        <Link to="/transactions" className={linkStyle("/transactions")}>Transactions</Link>
        <Link to="/goals" className={linkStyle("/goals")}>Goals</Link>
        <Link to="/insights" className={linkStyle("/insights")}>Insights</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
