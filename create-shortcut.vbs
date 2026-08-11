Set ws = CreateObject("WScript.Shell")
Set sc = ws.CreateShortcut(ws.SpecialFolders("Desktop") & "\Iveco CRM.lnk")
sc.TargetPath = "C:\Users\Murat\.gemini\antigravity\scratch\iveco-crm\start-crm.bat"
sc.WorkingDirectory = "C:\Users\Murat\.gemini\antigravity\scratch\iveco-crm"
sc.Description = "Iveco CRM Baslatici"
sc.WindowStyle = 1
sc.Save
WScript.Echo "Masaustu kisayolu olusturuldu!"
