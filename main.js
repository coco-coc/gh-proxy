// 主题切换功能
document.getElementById('themeSwitch').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
  
  const icon = this.querySelector('i');
  if (document.body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});

// 显示提示信息
function showToast(message) {
  const toast = document.getElementById('copyToast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// 复制功能
function copyResult(elementId, message) {
  const element = document.getElementById(elementId);
  element.select();
  document.execCommand('copy');
  showToast(message);
}

// 转换脚本
function convertScript() {
  let inputStr = document.getElementById("githubScript").value;
  if (!inputStr) {
    showToast("请输入脚本命令");
    return;
  }

  const ghproxy = document.getElementById("ghproxy").value;
  const perlcmdbegin = ' | perl -pe "$(curl -L ';
  const perlcmdend = ')"';
  const perlrule = ghproxy + 'perl-pe-para';

  // 给裸的git类链接前面加上 https://
  inputStr = inputStr.replace(/ git/g, ' https://git');

  // 处理 bash <( curl xxx.sh) 或 bash <( wget -O- xxx.sh)
  const regex1 = /(bash.*?)(https?:\/\/.*?)(\).*)/s;
  
  // 多层代理（处理嵌套脚本）
  const replacement1 = '$1' + ghproxy + '$2' + perlcmdbegin + perlrule + perlcmdend + '$3';
  const resultStr1 = inputStr.replace(regex1, replacement1);
  if (resultStr1 !== inputStr) {
    document.getElementById("result1").value = resultStr1;
  }

  // 单层代理
  const replacement2 = '$1' + ghproxy + '$2' + ' | perl -pe "s#(http.*?git[^/]*?/)#' + ghproxy + '\\1#g"' + '$3';
  let resultStr2 = inputStr.replace(regex1, replacement2);
  if (resultStr2 !== inputStr) {
    document.getElementById("result2").value = resultStr2;
  }

  // 处理 wget xxx.sh && bash xxx.sh 或 wget xxx.sh && chmod +x xxx.sh && ./xxx.sh
  const regex2 = /(wget.*?)(https?:\/\/.*)(&&[^&]*[ /])(.*?sh)/s;
  const replacement3 = '$1' + ghproxy + '$2' + '&& perl -i -pe "s#(http.*?git[^/]*?/)#' + ghproxy + '\\1#g" ' + '$4 $3$4';
  resultStr2 = inputStr.replace(regex2, replacement3);
  if (resultStr2 !== inputStr) {
    document.getElementById("result2").value = resultStr2;
  }

  // 处理 curl -sS -O xxx.sh && bash xxx.sh
  const regex3 = /^(curl.*?)(https?:\/\/.*)(&&[^&]*[ /])(.*?sh)/s;
  const replacement4 = '$1' + ghproxy + '$2' + '&& perl -i -pe "s#(http.*?git[^/]*?/)#' + ghproxy + '\\1#g" ' + '$4 $3$4';
  resultStr2 = inputStr.replace(regex3, replacement4);
  if (resultStr2 !== inputStr) {
    document.getElementById("result2").value = resultStr2;
  }

  // 如果没有转换结果，显示提示
  if (resultStr1 === inputStr && resultStr2 === inputStr) {
    showToast("未识别到GitHub脚本命令");
  } else {
    showToast("转换成功!");
  }
}

// 使用当前页面作为代理
function getLocalUrl() {
  document.getElementById("ghproxy").value = window.location.origin + window.location.pathname;
  showToast("已设置为当前页面地址");
}

// 转换资源URL
function convertRes() {
  let inputStr = document.getElementById("githubRes").value;
  if (!inputStr) {
    showToast("请输入资源链接");
    return;
  }

  const ghproxy = document.getElementById("ghproxy").value;
  
  // 给裸的git类链接前面加上 https://
  inputStr = inputStr.replace(/ git/g, ' https://git');
  
  const resultStr = ghproxy + inputStr;
  document.getElementById("resAfterGhproxy").value = resultStr;
  showToast("资源链接已转换");
}

// 打开转换后的资源链接
function fetchRes() {
  const url = document.getElementById("resAfterGhproxy").value;
  if (url) {
    window.open(url, '_blank');
  } else {
    showToast("请先转换资源链接");
  }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
  getLocalUrl();
  
  // 设置示例命令
  document.getElementById("githubScript").value = "bash <(curl -L https://github.com/coco-coc/warp.sh/raw/main/warp.sh) 4";
  document.getElementById("githubRes").value = "https://github.com/crazypeace/warp.sh/raw/main/warp.sh";
});
