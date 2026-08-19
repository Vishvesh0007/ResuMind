import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
    { title: "ResuMind | Admin Dashboard" },
    { name: "description", content: "Track logged-in users and platform analytics" },
];

const AdminDashboard = () => {
    const { auth, isLoading, admin, kv } = usePuterStore();
    const navigate = useNavigate();

    const [userList, setUserList] = useState<AdminUserRecord[]>([]);
    const [totalResumes, setTotalResumes] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const loadAdminData = async () => {
        setIsFetching(true);
        try {
            const users = await admin.getUsers();
            setUserList(users);

            const resumeKeys = await kv.list("resume:*");
            setTotalResumes(Array.isArray(resumeKeys) ? resumeKeys.length : 0);
        } catch (err) {
            console.error("Error loading admin stats:", err);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            loadAdminData();
        }
    }, [isLoading]);

    const activeLast24h = userList.filter((u) => {
        const lastSeenDate = new Date(u.lastSeen).getTime();
        const past24h = Date.now() - 24 * 60 * 60 * 1000;
        return lastSeenDate > past24h;
    }).length;

    const filteredUsers = userList.filter(
        (u) =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.uuid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        if (userList.length === 0) return;
        const headers = "Username,Puter UUID,First Login,Last Active,Login Count\n";
        const rows = userList
            .map(
                (u) =>
                    `"${u.username}","${u.uuid}","${u.firstSeen}","${u.lastSeen}",${u.loginCount}`
            )
            .join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resumind-user-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddDemoData = async () => {
        setIsFetching(true);
        try {
            const demoUsers: AdminUserRecord[] = [
                {
                    uuid: "usr_alex_dev_99182",
                    username: "alex_developer",
                    firstSeen: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
                    lastSeen: new Date().toISOString(),
                    loginCount: 14,
                },
                {
                    uuid: "usr_sarah_recruiter_44120",
                    username: "sarah_recruiter",
                    firstSeen: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
                    lastSeen: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
                    loginCount: 8,
                },
                {
                    uuid: "usr_johndoe_candidate_11204",
                    username: "johndoe_tech",
                    firstSeen: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
                    lastSeen: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
                    loginCount: 3,
                },
            ];

            for (const usr of demoUsers) {
                await kv.set(`admin:user:${usr.uuid}`, JSON.stringify(usr));
            }
            await loadAdminData();
        } catch (err) {
            console.error("Failed to add demo data:", err);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                                Admin Analytics Control Panel
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mt-2">Logged-in Users Dashboard</h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Track how many people are logged in, session activity logs, and resume usage statistics.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            disabled={userList.length === 0}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                        >
                            <span>📥</span> Export CSV
                        </button>

                        <button
                            onClick={loadAdminData}
                            disabled={isFetching}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                        >
                            <svg className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isFetching ? "Refreshing..." : "Refresh Stats"}
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">Total Users Logged In</span>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                                👤
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-white">{userList.length}</span>
                            <span className="text-xs text-slate-400 ml-2">Unique Accounts</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">Active (Last 24 Hours)</span>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                                ⚡
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-white">{activeLast24h}</span>
                            <span className="text-xs text-emerald-400 ml-2">Recent Sessions</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium">Resumes Analyzed</span>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                                📄
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-white">{totalResumes}</span>
                            <span className="text-xs text-purple-400 ml-2">Stored Entries</span>
                        </div>
                    </div>
                </div>

                {/* User Directory Table Container */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>Logged-in User Directory</span>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-normal">
                                {filteredUsers.length} shown
                            </span>
                        </h2>

                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search by username or UUID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors w-64"
                            />
                            {userList.length === 0 && (
                                <button
                                    onClick={handleAddDemoData}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                                >
                                    + Populate Sample Users
                                </button>
                            )}
                        </div>
                    </div>

                    {isFetching && userList.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p>Loading user activity records from Puter KV...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <p className="text-base font-medium text-slate-300">
                                {searchTerm ? "No users matching search query" : "No User Logins Recorded Yet"}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {searchTerm
                                    ? "Try clearing the search term filter."
                                    : "User logins will automatically be logged here when users sign in."}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={handleAddDemoData}
                                    className="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
                                >
                                    Add Demo Analytics Data
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3.5">User Profile</th>
                                        <th className="px-6 py-3.5">Puter UUID</th>
                                        <th className="px-6 py-3.5">First Login</th>
                                        <th className="px-6 py-3.5">Last Active</th>
                                        <th className="px-6 py-3.5">Total Sessions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {filteredUsers.map((usr) => {
                                        const isOnline = new Date(usr.lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
                                        return (
                                            <tr key={usr.uuid} className="hover:bg-slate-900/40 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">
                                                        {usr.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white flex items-center gap-2">
                                                            {usr.username}
                                                            {isOnline && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                    Active Now
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{usr.uuid}</td>
                                                <td className="px-6 py-4 text-xs text-slate-400">
                                                    {new Date(usr.firstSeen).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-300 font-medium">
                                                    {new Date(usr.lastSeen).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-indigo-400">
                                                    {usr.loginCount || 1}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
