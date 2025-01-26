class UserData{
  constructor(){
    this.termTemplate={0:"前期前", 1:"前期後" ,2:"前期", 3:"集中（前期）", 4:"後期前", 5:"後期後" ,6:"後期", 7:"集中（後期）"};
    this.gradeTemplate={0:"不可",1:"可",2:"良",3:"優",4:"秀"};
    this.name = "";
    this.credits = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 ,6:0,7:0};
    this.courseList=[];
    this.termData = {};
    this.accumTermData = {};
    this.DsList= [];
   }

  // 成績データをまとめたcsvファイルを作成するメソッド
  // 引数1:ダウンロード実行用エレメントのID名 引数2:出力ファイル名
  makeCSVFile(elementID,outputName){
  // makeCSVFile(){
    let text = "\uFEFF"+this.name+"さんの成績\n";
    for(let row=0;row<this.courseList.length;row++){
      for(let i=0;i<5;i++){
        if(this.courseList[row]&&this.courseList[row][i])text += this.courseList[row][i]+",";
        else text += ",";
      }
      text += "\n";
    }
    console.log("createCSVfromNow");

    // return text;

    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const link = document.getElementById(elementID);
    link.href = URL.createObjectURL(blob);
    link.download = outputName;
  }
 
  
  

  // pdfを読み込んで作成された単一の講義情報配列を共通の形式にして二次元配列に変換する。
  // 引数1:単一の講義情報配列のインデクス数 引数2:単一の講義情報配列
  setNewData(sellCount,data){
    if(sellCount==5){
      this.courseList.push(data);
      if(data[2]==this.gradeTemplate[0])this.DsList.push(data);
    }
    else if(sellCount==3){
      let newRow = [data[0],,,data[1],data[2]];
      this.courseList.push(newRow);
    }
    else if(sellCount==2){
      if(data[0]=="ログインユーザ ：")this.name=data[1];
      else window.alert("error.code.DontExpectDataAmount:2");
    }else window.alert("error.code.DontExpectDataAmount:"+data.length);
  }

  // 講義情報二次元配列から単位数と評価を抜き出して、開講時期ごとにまとめる。
  // 引数なし。
  makeTermData(){
    let result=0;//評価
    let credit=0;//単位数
    let term = "";//開講時期
    let year = 2020;//開講年
    for(let row=0;row<this.courseList.length;row++){
      year = this.courseList[row][3];
      term = this.courseList[row][4];
      credit = Number(this.courseList[row][1]);
      for(let gradeIndex=0;gradeIndex<5;gradeIndex++){
        if(this.courseList[row][2]!==this.gradeTemplate[gradeIndex])result=-1;
        else {result = gradeIndex;break;}
      }
      if(result!==-1){
        if(!(year in this.termData))this.termData[year]={};
        if (!(term in this.termData[year]))this.termData[year][term] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 ,6:0};
        this.termData[year][term][result] += credit;
        this.termData[year][term][5] += credit;
        this.termData[year][term][6] += result * credit;
        this.credits[result] += credit;
        this.credits[5] += credit;
        this.credits[6] += result*credit;
      }
    }
    this.credits[7] = this.credits[6]/this.credits[5];
  }

  // 累積時期別単位数オブジェクトの作成
  // 引数なし。
  makeAccumTermData(){
    let tmpObject = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 ,6:0,7:0}
    let startYear = 2019;
    let reIndex = 0;
    while(!(startYear in this.termData))startYear++;
    for(let year=startYear;year<startYear+Object.keys(this.termData).length+reIndex;year++){
      if(!(year in this.termData)){
        reIndex += 1;
        continue;
      }
      if(!(year in this.accumTermData))this.accumTermData[year] = {};
      for(let termIndex=0;termIndex<Object.keys(this.termTemplate).length;termIndex++){
        if(this.termTemplate[termIndex] in this.termData[year]){
          if(!(this.termTemplate[termIndex] in this.accumTermData[year]))this.accumTermData[year][this.termTemplate[termIndex]] = {};
          for(let j=0;j<7;j++){
            tmpObject[j] += this.termData[year][this.termTemplate[termIndex]][j];
            this.accumTermData[year][this.termTemplate[termIndex]][j] = tmpObject[j];
          }
          this.accumTermData[year][this.termTemplate[termIndex]][7] = this.accumTermData[year][this.termTemplate[termIndex]][6]/this.accumTermData[year][this.termTemplate[termIndex]][5];
        }
      }
    }
  }

  // termDataからhtml表示用のtableを作成する。
  // 引数:開始年数
  createResultTable() {
    const table = document.createElement("table");
    table.setAttribute("border","radius");
    let startYear = 2010;
    while(!(startYear in this.termData))startYear++;
    let reIndex = 0;
    
    //年の行
    const trYear = document.createElement("tr");
    const thYearElement = document.createElement("th");
    thYearElement.textContent = "年";
    trYear.appendChild(thYearElement);
    reIndex = 0;
    for(let year=startYear;year<startYear+Object.keys(this.termData).length+reIndex;year++){
      if(!(year in this.termData)){
        reIndex += 1;
        continue;
      }
      const thYearElement = document.createElement("th");
      thYearElement.textContent = year;
      thYearElement.setAttribute("colspan",Object.keys(this.termData[year]).length);
      trYear.appendChild(thYearElement);
    }
    table.appendChild(trYear);

    // 開講時期の行
    const trTerm = document.createElement("tr");
    const thTermElement = document.createElement("th");
    thTermElement.textContent = "開講時期";
    trTerm.appendChild(thTermElement);
    reIndex = 0;
    for(let year=startYear;year<startYear+Object.keys(this.termData).length+reIndex;year++){
      if(!(year in this.termData)){
        reIndex += 1;
        continue;
      }  
      for(let termIndex=0;termIndex<Object.keys(this.termTemplate).length;termIndex++){
        if(this.termTemplate[termIndex] in this.termData[year]){
          const tdTermElement = document.createElement("td");
          tdTermElement.textContent = this.termTemplate[termIndex];
          trTerm.appendChild(tdTermElement);
        }
      }
    }
    const tdTermElement = document.createElement("td");
    tdTermElement.textContent = "評価合計";
    trTerm.appendChild(tdTermElement);
    table.appendChild(trTerm);

    // 秀などの行など
    for(let gradeIndex=Object.keys(this.gradeTemplate).length-1;gradeIndex>=0;gradeIndex--){
      const trS = document.createElement("tr");
      const thSElement = document.createElement("th");
      thSElement.textContent = this.gradeTemplate[gradeIndex];
      trS.appendChild(thSElement);
      reIndex = 0;
      for(let year=startYear;year<startYear+Object.keys(this.termData).length+reIndex;year++){
        if(!(year in this.termData)){
          reIndex += 1;
          continue;
        }
        for(let termIndex=0;termIndex<Object.keys(this.termTemplate).length;termIndex++){      
          if (this.termTemplate[termIndex] in this.termData[year]){
            const tdSElement = document.createElement("td");
            tdSElement.textContent = this.termData[year][this.termTemplate[termIndex]][gradeIndex];
            trS.appendChild(tdSElement);
          }
        }
      }
      const tdSElement = document.createElement("td");
      tdSElement.textContent = this.credits[gradeIndex];
      trS.appendChild(tdSElement);
      table.appendChild(trS);
    }
    
    // 時期合計の行
    const trT = document.createElement("tr");
    const thTElement = document.createElement("th");
    thTElement.textContent = "時期合計";
    trT.appendChild(thTElement);
    reIndex = 0;
    for(let year=startYear;year<startYear+Object.keys(this.termData).length+reIndex;year++){
      if(!(year in this.termData)){
        reIndex += 1;
        continue;
      }
      for(let termIndex=0;termIndex<Object.keys(this.termTemplate).length;termIndex++){      
        if (this.termTemplate[termIndex] in this.termData[year]){
          const tdTElement = document.createElement("td");
          tdTElement.textContent = this.termData[year][this.termTemplate[termIndex]][5];
          trT.appendChild(tdTElement);
        }
      }
    }
    const tdTElement = document.createElement("td");
    tdTElement.textContent = this.credits[5];
    trT.appendChild(tdTElement);
    table.appendChild(trT);
    return table; 
  }

  createGPAGraphy(idName){
    const today = new Date();
    const thisYear = today.getFullYear();
    let canvas = document.getElementById(idName);
    let dataList = [];
    let labelList = [];
    let startYear = 2010;
    while(!(startYear in this.accumTermData))startYear++;
    // 表示データ作成セクション
    while(thisYear >= startYear){
      if(startYear in this.accumTermData){
        for(let i=0;i<8;i++){
          if(this.termTemplate[i] in this.accumTermData[startYear]){
            // label作成
            labelList.push(startYear + this.termTemplate[i]);
            // data作成
            dataList.push(this.accumTermData[startYear][this.termTemplate[i]][7]);
          }
        }
      }
      startYear++;
    }

    let chart = new Chart(canvas,
      {
        type:'line',
        data:{
          labels: labelList,
          datasets:
          [
            {
              label:"GPA",
              data: dataList,
              borderWidth:1,
            }
          ]
        },
        options:
        {
          title:{
            display:true,
            text:"sampleGraph",
          },
          scales:{
            y:{
              beginAtZero:true,
            }
          }
        },
      }
    ) 

  }

}


document.getElementById('startUp').innerText = "T";

const userData = new UserData();
document.getElementById('inputPDF').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const typedArray = new Uint8Array(e.target.result);
      try{
        document.getElementById('stepOne-01').innerText = "T";
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let textContent = '';
        let flagNewLine = false;
        let loopFalseCount =0;
        let loopDataCount = 0;
        let dataOfLesson = [];
        document.getElementById('stepOne-02').innerText = "T";

        for (let i = 1; i <= pdf.numPages; i++) {
          document.getElementById('stepOne-03').innerText = i.toString();
          try{
            const page = await pdf.getPage(i);
            document.getElementById('stepOne-04').innerText = i.toString();

            try{
              const text = await page.getTextContent();
              document.getElementById('stepOne-05').innerText = i.toString();

              text.items.forEach(function(item){
                flagNewLine = false;
                loopFalseCount =0;
                while(item.str[0]==" "||item.str[0]=="　" ||item.str[0]==" "||item.str[0]==" "){
                  if(loopFalseCount>3){
                    flagNewLine = true;
                  }
                  item.str=item.str.slice(1);
                  loopFalseCount++; 
                }
                if(item.str[0] != "■" &&
                   item.str != "分野系列名／科目名" && 
                   item.str != "単位" && 
                   item.str != "評価" &&
                   item.str != "年度" &&
                   item.str != "期間" &&
                   item.str != "成績照会" &&
                   item.str != false &&
                   item.str != "▲ページ上部へ移動する"
                  ){ 
                  if(flagNewLine){
                    userData.setNewData(loopDataCount,dataOfLesson);
                    textContent+="\n";
                    loopDataCount = 0;
                    dataOfLesson = [];
                  }
                  dataOfLesson[loopDataCount] = item.str;
                  loopDataCount++;
                }
                else 
                flagNewLine=false;
              });
              document.getElementById('stepOne-06').innerText = i.toString();

            }catch(error){
              window.alert("error.code.We can't get contents in "+i+" page.");
            }
          }catch(error){
            window.alert("error.code.We can't get ",i," page.");
          }
        }
        document.getElementById('stepTwo-01').innerText = "T";
        
        userData.makeTermData();

        userData.makeAccumTermData();

        document.getElementById('stepThree-01').innerText = "T";
        

        const container = document.getElementById("table-container");
        const table = userData.createResultTable();
        container.appendChild(table);

        document.getElementById('stepFour-01').innerText = "T";

        
        userData.makeCSVFile("downloadButton","output2.csv");

        document.getElementById('stepFive-01').innerText = "T";

        userData.createGPAGraphy("myChart");

        document.getElementById('stepSix-01').innerText = "T";

        // console.log(userData);

      }catch(error){
        window.alert("error.code.We can't get and read this PDF.");
      }
    };
    reader.readAsArrayBuffer(file);
  }
});

