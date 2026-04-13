import fs from 'fs';

let c = fs.readFileSync('src/pages/VaultReports.jsx', 'utf8');

c = c.replace(
    '{isWithdrawal && <><span className="text-slate-400">Admin Drawer</span> <ArrowDownToLine size={14} className="text-amber-400 mx-1"/> <span className="text-white">Customer</span></>}', 
    '{isWithdrawal && <><span className="text-slate-400">Admin Drawer</span> <ArrowDownToLine size={14} className="text-amber-400 mx-1"/> <span className="text-white">Customer</span></>}\n                                {isLoanApproval && <><span className="text-slate-400">Bank Vault</span> <ArrowDownToLine size={14} className="text-purple-400 mx-1"/> <span className="text-white">Customer</span></>}\n                                {isLoanRepayment && <><span className="text-white">Customer</span> <ArrowUpFromLine size={14} className="text-indigo-400 mx-1"/> <span className="text-slate-400">Bank Vault</span></>}'
);

fs.writeFileSync('src/pages/VaultReports.jsx', c);
console.log("Success");
