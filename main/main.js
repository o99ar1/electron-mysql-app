const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise'); // ربط MySQL

// الاتصال بقاعدة البيانات
async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',      // ضع كلمة مرور MySQL إذا موجودة
      database: 'mydb'   // اسم قاعدة البيانات
    });
    console.log('✅ Connected to MySQL');
    return connection;
  } catch (err) {
    console.error('❌ MySQL Connection Error:', err);
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  mainWindow.loadFile('renderer/index.html');

  // إنشاء القائمة
  const menuTemplate = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'فتح ملف',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile']
            }).then(result => {
              if (!result.canceled) {
                const data = fs.readFileSync(result.filePaths[0], 'utf-8');
                mainWindow.webContents.send('file-data', data);
              }
            });
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' }
      ]
    },
    {
      label: 'عرض',
      submenu: [{ role: 'reload' }, { role: 'toggledevtools', label: 'أدوات المطور' }]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

// حفظ بيانات في MySQL
ipcMain.on('save-data', async (event, data) => {
  const connection = await connectDB();
  if (!connection) {
    event.reply('data-saved', '❌ فشل الاتصال بقاعدة البيانات');
    return;
  }

  try {
    await connection.execute('INSERT INTO saved_data (text) VALUES (?)', [data]);
    event.reply('data-saved', '✅ تم حفظ البيانات في MySQL!');
  } catch (err) {
    console.error(err);
    event.reply('data-saved', '❌ خطأ أثناء الحفظ');
  } finally {
    await connection.end();
  }
});

// جلب بيانات من MySQL
ipcMain.on('get-data', async (event) => {
  const connection = await connectDB();
  if (!connection) {
    event.reply('load-data', '');
    return;
  }

  try {
    const [rows] = await connection.execute('SELECT text FROM saved_data ORDER BY id DESC LIMIT 1');
    const saved = rows.length ? rows[0].text : '';
    event.reply('load-data', saved);
  } catch (err) {
    console.error(err);
    event.reply('load-data', '');
  } finally {
    await connection.end();
  }
});
