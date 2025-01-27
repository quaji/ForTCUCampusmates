function logMemoryUsage() {
    if (performance.memory) {
      const usedJSHeapSize = performance.memory.usedJSHeapSize / 1024 / 1024; // MB単位
      const totalJSHeapSize = performance.memory.totalJSHeapSize / 1024 / 1024; // MB単位
      const jsHeapLimit = performance.memory.jsHeapSizeLimit / 1024 / 1024; // MB単位
  
      console.log(`使用中のヒープサイズ: ${usedJSHeapSize.toFixed(2)} MB`);
      console.log(`ヒープの合計サイズ: ${totalJSHeapSize.toFixed(2)} MB`);
      console.log(`ヒープの制限サイズ: ${jsHeapLimit.toFixed(2)} MB`);
        
      document.getElementById('memoryObs').innerText = `使用中のヒープサイズ: ${usedJSHeapSize.toFixed(2)} MB`;
      // メモリ不足に近づいているかを判定
      if (usedJSHeapSize / jsHeapLimit > 0.8) {
        console.warn("警告: メモリ使用量が80%を超えています！");
      }
    } else {
      console.warn("performance.memory APIはこのブラウザではサポートされていません。");
    }
  }
  
 // 定期的にメモリ使用状況を監視
setInterval(logMemoryUsage, 50); // 5秒ごとにチェック
  