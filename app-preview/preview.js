/* The markup and CSS come from the real desktop components. Only the website's
 * sidebar view switching and editable demonstration text are handled here. */
(() => {
  const root=document.getElementById('root');
  const pages=JSON.parse(document.getElementById('preview-pages').textContent);
  const views=new Map([['新任务','new-task'],['定时任务','schedule'],['扩展','extensions'],['准备产品发布','task'],['调研市场与竞品','research']]);
  const projects=[
    {title:'网站',threads:['准备产品发布']},
    {title:'调研',threads:['调研市场与竞品']},
    {title:'日常办公',threads:['整理会议纪要','汇总本月报销明细','起草客户回访邮件']},
  ];
  const recentThreads=['整理供应商报价','提取合同关键条款','制作新员工培训课件'];
  let activeConversation='task';
  let sidebarWidth=240;
  let resizing=null;
  function populateSidebar(){
    const sidebar=root.querySelector('.app-shell-left-panel');
    const original=sidebar.querySelector('[data-app-action-sidebar-thread-active="false"]').closest('[role="listitem"]').cloneNode(true);
    const originalList=sidebar.querySelector('[data-sidebar-project-kind][role="listitem"] [role="list"]').cloneNode(false);
    let sequence=0;
    function thread(title){
      const item=original.cloneNode(true);
      item.querySelectorAll('[id],[aria-labelledby],[aria-describedby]').forEach(node=>{
        node.removeAttribute('id');node.removeAttribute('aria-labelledby');node.removeAttribute('aria-describedby');
      });
      const row=item.querySelector('[data-app-action-sidebar-thread-row]');
      const selected=views.get(title)===activeConversation;
      row.setAttribute('aria-label',title);
      row.dataset.appActionSidebarThreadId=`preview-office-${++sequence}`;
      row.dataset.appActionSidebarThreadTitle=title;
      row.dataset.appActionSidebarThreadActive=String(selected);
      row.dataset.appActionSidebarThreadSelected=String(selected);
      row.classList.toggle('bg-primary-ghost-hover',selected);
      if(selected)row.setAttribute('aria-current','page');else row.removeAttribute('aria-current');
      row.querySelector('[data-thread-title] [dir="auto"]').textContent=title;
      item.querySelector('[role="group"]').style.cursor='default';
      return item;
    }
    sidebar.querySelectorAll('[data-sidebar-project-kind][role="listitem"]').forEach((group,index)=>{
      const project=projects[index];
      const header=group.querySelector('[data-app-action-sidebar-project-row]');
      const previous=header.dataset.appActionSidebarProjectLabel;
      header.dataset.appActionSidebarProjectLabel=project.title;
      header.querySelector('[data-marquee-content] > span').textContent=project.title;
      group.setAttribute('aria-label',project.title);
      group.querySelectorAll('[aria-label]').forEach(node=>node.setAttribute('aria-label',node.getAttribute('aria-label').replaceAll(previous,project.title)));
      let list=group.querySelector('[role="list"]');
      if(!list){
        list=originalList.cloneNode(false);
        group.querySelector('[data-app-action-sidebar-project-list-id]').replaceChildren(list);
      }
      list.setAttribute('aria-label',`${project.title}中的对话`);
      list.replaceChildren(...project.threads.map(thread));
      // Captures retain the native animation's settled pixel height. Let new
      // demonstration rows determine their container height instead.
      group.querySelectorAll('[style]').forEach(node=>{if(node.contains(list)&&node.style.height)node.style.height='auto';});
    });
    sidebar.querySelector('[data-app-action-sidebar-section-heading="Recents"] [role="list"]').replaceChildren(...recentThreads.map(thread));
  }
  function renderConversation(){
    if(!activeConversation)return;
    if(activeConversation==='research'){
      root.querySelectorAll('button').forEach(button=>{
        if(!button.closest('.app-shell-left-panel')&&button.textContent.trim()==='准备产品发布')button.textContent='调研市场与竞品';
        if(button.getAttribute('aria-label')==='项目：网站')button.setAttribute('aria-label','项目：调研');
      });
      root.querySelector('[data-markdown-text-tone="user-message"] p').textContent='帮我调研适合团队的办公 AI 工具，整理选型维度和试用计划。';
      const reply=root.querySelector('[data-markdown-text-style="assistant-message"]');
      const copy=['先按下面的框架评估，具体结果通过试用验证：','核心使用场景','整理文档、会议纪要和项目资料','汇总市场信息，形成可追溯的调研报告','制作活动海报和内部培训素材','重点对比维度','中文内容质量、资料引用和协作能力','工具连接方式、使用成本和权限管理','一周试用计划','选取同一份办公任务，记录完成时间与修改次数','汇总团队反馈，再决定是否扩大使用','建议先验证高频工作是否顺畅，再比较功能数量。'];
      reply.querySelectorAll(':scope > p,:scope > h3,:scope > ul > li').forEach((node,index)=>node.textContent=copy[index]);
      return;
    }
    // Reuse the native conversation turn for the image-generation example.
    const firstTurn=root.querySelector('[data-turn-key]');
    const imageTurn=firstTurn.cloneNode(true);
    imageTurn.dataset.turnKey='history-content:turn:preview-image';
    imageTurn.style.marginTop='32px';
    imageTurn.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    imageTurn.querySelector('[data-markdown-text-tone="user-message"] p').textContent='再生成一张团队创意工作坊海报，作为发布活动的宣传图。';
    const reply=imageTurn.querySelector('[data-markdown-text-style="assistant-message"]');
    const paragraph=reply.querySelector('p').cloneNode(false);
    paragraph.textContent='已生成活动海报，可用于团队群公告和活动邀请。';
    const poster=document.createElement('img');
    poster.src='./images/team-workshop.webp';poster.alt='团队创意工作坊活动海报';
    poster.width=1200;poster.height=800;
    poster.style.cssText='display:block;width:min(100%,520px);height:auto;border-radius:12px';
    reply.replaceChildren(paragraph,poster);
    firstTurn.after(imageTurn);
    firstTurn.closest('[data-thread-find-target="conversation"]').querySelectorAll('[style]').forEach(node=>{
      if(node.contains(firstTurn)&&/^\d+(\.\d+)?px$/.test(node.style.height))node.style.height='auto';
    });
  }
  // Native sidebar limits (aM in app-initial): 240–520px, reserving 240px for content.
  function resizeSidebar(width){
    const sidebar=root.querySelector('.app-shell-left-panel');
    const zoom=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--codex-window-zoom'))||1;
    sidebarWidth=Math.max(240,Math.min(width,520,window.innerWidth/zoom-240));
    sidebar.style.width=sidebarWidth+'px';
    sidebar.firstElementChild.style.width=sidebarWidth+'px';
    sidebar.firstElementChild.style.minWidth=sidebarWidth+'px';
    root.querySelector('[data-test-id="header-shell-slot"]').style.width=sidebarWidth+'px';
    sidebar.querySelector('[role="separator"]').setAttribute('aria-valuenow',Math.round(sidebarWidth));
  }
  function configure(){
    populateSidebar();
    const sidebar=root.querySelector('.app-shell-left-panel');
    root.querySelectorAll('button,a,[role="button"],[role="checkbox"],[role="radio"]').forEach(control=>{
      const label=(control.getAttribute('aria-label')??control.textContent??'').trim();
      if(!sidebar?.contains(control)||!views.has(label)){
        control.setAttribute('aria-disabled','true');control.tabIndex=-1;control.style.pointerEvents='none';
      }else{control.removeAttribute('aria-disabled');control.tabIndex=0;control.dataset.previewView=views.get(label);}
    });
    root.querySelectorAll('input,textarea').forEach(input=>{input.readOnly=true;input.tabIndex=-1;});
    root.querySelectorAll('[contenteditable="true"]').forEach(editor=>{editor.tabIndex=0;editor.setAttribute('aria-label','输入消息（仅演示，不会发送）');});
    const divider=sidebar.querySelector('[role="separator"]');
    divider.tabIndex=0;divider.setAttribute('aria-label','调整侧边栏宽度');
    divider.setAttribute('aria-valuemin','240');divider.setAttribute('aria-valuemax','520');
    resizeSidebar(sidebarWidth);
  }
  root.addEventListener('pointerdown',event=>{
    const divider=event.target.closest('.app-shell-left-panel [role="separator"]');
    if(!divider||event.button!==0)return;
    event.preventDefault();divider.setPointerCapture(event.pointerId);
    const sidebar=divider.closest('.app-shell-left-panel');
    resizing={divider,pointerId:event.pointerId,x:event.clientX,width:sidebarWidth,scale:sidebar.getBoundingClientRect().width/sidebar.offsetWidth};
    document.body.style.cursor='col-resize';document.body.style.userSelect='none';
  });
  root.addEventListener('pointermove',event=>{
    if(!resizing||event.pointerId!==resizing.pointerId)return;
    event.preventDefault();resizeSidebar(resizing.width+(event.clientX-resizing.x)/resizing.scale);
  });
  function endResize(event){
    if(!resizing||event.pointerId!==resizing.pointerId)return;
    if(resizing.divider.hasPointerCapture(event.pointerId))resizing.divider.releasePointerCapture(event.pointerId);
    resizing=null;document.body.style.cursor='';document.body.style.userSelect='';
  }
  root.addEventListener('pointerup',endResize);root.addEventListener('pointercancel',endResize);
  root.addEventListener('dblclick',event=>{if(event.target.closest('.app-shell-left-panel [role="separator"]'))resizeSidebar(275);});
  root.addEventListener('keydown',event=>{
    if(!event.target.matches('.app-shell-left-panel [role="separator"]'))return;
    const width={ArrowLeft:sidebarWidth-10,ArrowRight:sidebarWidth+10,Home:240,End:520}[event.key];
    if(width!==undefined){event.preventDefault();resizeSidebar(width);}
  });
  root.addEventListener('click',event=>{
    const control=event.target.closest('button,a,[role="button"],[role="checkbox"],[role="radio"]');
    if(!control)return;
    event.preventDefault();event.stopPropagation();
    const page=control.dataset.previewView;
    if(page){
      activeConversation=page==='task'||page==='research'?page:null;
      root.innerHTML=pages[page==='research'?'task':page];
      renderConversation();configure();
    }
  });
  root.addEventListener('input',event=>{
    const editor=event.target.closest('[contenteditable="true"]');if(!editor)return;
    const empty=!editor.textContent.trim();
    editor.querySelectorAll('[data-placeholder]').forEach(p=>p.classList.toggle('placeholder',empty));
  });
  document.addEventListener('submit',event=>event.preventDefault(),true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.metaKey||event.ctrlKey))event.preventDefault();},true);
  renderConversation();configure();
})();
