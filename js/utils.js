/* global NexT, CONFIG */

HTMLElement.prototype.wrap = function(wrapper) {
  this.parentNode.insertBefore(wrapper, this);
  this.parentNode.removeChild(this);
  wrapper.appendChild(this);
};

NexT.utils = {

  /**
   * Wrap images with fancybox.
   */
  wrapImageWithFancyBox: function() {
    document.querySelectorAll('.post-body :not(a) > img, .post-body > img').forEach(element => {
      var $image = $(element);
      var imageLink = $image.attr('data-src') || $image.attr('src');
      var $imageWrapLink = $image.wrap(`<a class="fancybox fancybox.image" href="${imageLink}" itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>`).parent('a');
      if ($image.is('.post-gallery img')) {
        $imageWrapLink.attr('data-fancybox', 'gallery').attr('rel', 'gallery');
      } else if ($image.is('.group-picture img')) {
        $imageWrapLink.attr('data-fancybox', 'group').attr('rel', 'group');
      } else {
        $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default');
      }

      var imageTitle = $image.attr('title') || $image.attr('alt');
      if (imageTitle) {
        $imageWrapLink.append(`<p class="image-caption">${imageTitle}</p>`);
        // Make sure img title tag will show correctly in fancybox
        $imageWrapLink.attr('title', imageTitle).attr('data-caption', imageTitle);
      }
    });

    $.fancybox.defaults.hash = false;
    $('.fancybox').fancybox({
      loop   : true,
      helpers: {
        overlay: {
          locked: false
        }
      }
    });
  },

  registerExtURL: function() {
    document.querySelectorAll('span.exturl').forEach(element => {
      let link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(atob(element.dataset.url).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title;
      link.innerHTML = element.innerHTML;
      element.parentNode.replaceChild(link, element);
    });
  },

  /**
   * One-click copy code support.
   */
  registerCopyCode: function() {
    document.querySelectorAll('figure.highlight').forEach(element => {
      const box = document.createElement('div');
      element.wrap(box);
      box.classList.add('highlight-container');
      box.insertAdjacentHTML('beforeend', '<div class="copy-btn"><i class="fa fa-clipboard fa-fw"></i></div>');
      var button = element.parentNode.querySelector('.copy-btn');
      button.addEventListener('click', event => {
        var target = event.currentTarget;
        var code = [...target.parentNode.querySelectorAll('.code .line')].map(line => line.innerText).join('\n');
        var ta = document.createElement('textarea');
        ta.style.top = window.scrollY + 'px'; // Prevent page scrolling
        ta.style.position = 'absolute';
        ta.style.opacity = '0';
        ta.readOnly = true;
        ta.value = code;
        document.body.append(ta);
        const selection = document.getSelection();
        const selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
        ta.select();
        ta.setSelectionRange(0, code.length);
        ta.readOnly = false;
        var result = document.execCommand('copy');
        if (CONFIG.copycode.show_result) {
          target.querySelector('i').className = result ? 'fa fa-check fa-fw' : 'fa fa-times fa-fw';
        }
        ta.blur(); // For iOS
        target.blur();
        if (selected) {
          selection.removeAllRanges();
          selection.addRange(selected);
        }
        document.body.removeChild(ta);
      });
      button.addEventListener('mouseleave', event => {
        setTimeout(() => {
          event.target.querySelector('i').className = 'fa fa-clipboard fa-fw';
        }, 300);
      });
    });
  },

  wrapTableWithBox: function() {
    document.querySelectorAll('table').forEach(element => {
      const box = document.createElement('div');
      box.className = 'table-container';
      element.wrap(box);
    });
  },

  registerVideoIframe: function() {
    document.querySelectorAll('iframe').forEach(element => {
      const supported = [
        'www.youtube.com',
        'player.vimeo.com',
        'player.youku.com',
        'player.bilibili.com',
        'www.tudou.com'
      ].some(host => element.src.includes(host));
      if (supported && !element.parentNode.matches('.video-container')) {
        const box = document.createElement('div');
        box.className = 'video-container';
        element.wrap(box);
        let width = Number(element.width);
        let height = Number(element.height);
        if (width && height) {
          element.parentNode.style.paddingTop = (height / width * 100) + '%';
        }
      }
    });
  },

  registerScrollPercent: function() {
    var THRESHOLD = 50;
    var backToTop = document.querySelector('.back-to-top');
    var readingProgressBar = document.querySelector('.reading-progress-bar');
    // For init back to top in sidebar if page was scrolled after page refresh.
    window.addEventListener('scroll', () => {
      if (backToTop || readingProgressBar) {
        var docHeight = document.querySelector('.container').offsetHeight;
        var winHeight = window.innerHeight;
        var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
        var scrollPercent = Math.min(100 * window.scrollY / contentVisibilityHeight, 100);
        if (backToTop) {
          backToTop.classList.toggle('back-to-top-on', window.scrollY > THRESHOLD);
          backToTop.querySelector('span').innerText = Math.round(scrollPercent) + '%';
        }
        if (readingProgressBar) {
          readingProgressBar.style.width = scrollPercent.toFixed(2) + '%';
        }
      }
    });

    backToTop && backToTop.addEventListener('click', () => {
      window.anime({
        targets  : document.scrollingElement,
        duration : 500,
        easing   : 'linear',
        scrollTop: 0
      });
    });
  },

  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function() {
    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    document.querySelectorAll('.tabs ul.nav-tabs .tab').forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        var target = event.currentTarget;
        // Prevent selected tab to select again.
        if (!target.classList.contains('active')) {
          // Add & Remove active class on `nav-tabs` & `tab-content`.
          [...target.parentNode.children].forEach(element => {
            element.classList.remove('active');
          });
          target.classList.add('active');
          var tActive = document.getElementById(target.querySelector('a').getAttribute('href').replace('#', ''));
          [...tActive.parentNode.children].forEach(element => {
            element.classList.remove('active');
          });
          tActive.classList.add('active');
          // Trigger event
          tActive.dispatchEvent(new Event('tabs:click', {
            bubbles: true
          }));
        }
      });
    });

    window.dispatchEvent(new Event('tabs:register'));
  },

  registerCanIUseTag: function() {
    // Get responsive height passed from iframe.
    window.addEventListener('message', ({ data }) => {
      if ((typeof data === 'string') && data.includes('ciu_embed')) {
        var featureID = data.split(':')[1];
        var height = data.split(':')[2];
        document.querySelector(`iframe[data-feature=${featureID}]`).style.height = parseInt(height, 10) + 5 + 'px';
      }
    }, false);
  },

  registerActiveMenuItem: function() {
    document.querySelectorAll('.menu-item').forEach(element => {
      var target = element.querySelector('a[href]');
      if (!target) return;
      var isSamePath = target.pathname === location.pathname || target.pathname === location.pathname.replace('index.html', '');
      var isSubPath = !CONFIG.root.startsWith(target.pathname) && location.pathname.startsWith(target.pathname);
      element.classList.toggle('menu-item-active', target.hostname === location.hostname && (isSamePath || isSubPath));
    });
  },

  registerLangSelect: function() {
    let selects = document.querySelectorAll('.lang-select');
    selects.forEach(sel => {
      sel.value = CONFIG.page.lang;
      sel.addEventListener('change', () => {
        let target = sel.options[sel.selectedIndex];
        document.querySelectorAll('.lang-select-label span').forEach(span => span.innerText = target.text);
        let url = target.dataset.href;
        window.pjax ? window.pjax.loadUrl(url) : window.location.href = url;
      });
    });
  },

  registerSidebarTOC: function() {
    const navItems = document.querySelectorAll('.post-toc li');
    // 跳转（叶子单击/标题双击）触发时为 true，使 activateNavByIndex 只高亮不展开路径
    var skipActivate = false;
    // 给有子目录的项加 has-child 标记，用于 CSS 显示展开/收起箭头
    navItems.forEach(element => {
      if (element.querySelector(':scope > .nav-child')) element.classList.add('has-child');
    });
    const sections = [...navItems].map(element => {
      var link = element.querySelector('a.nav-link');
      var target = document.getElementById(decodeURI(link.getAttribute('href')).replace('#', ''));
      // 单击：toggle 折叠/展开（展开中→收起全部后代；收起中→展开一层直接子级）
      // 双击：滚动跳转到该标题内容
      var clickTimer = null;
      link.addEventListener('click', event => {
        event.preventDefault();
        // 无子标题的叶子项：单击直接跳转（无需 toggle，不展开上面）
        if (!element.classList.contains('has-child')) {
          var offset = target.getBoundingClientRect().top + window.scrollY;
          skipActivate = true;
          window.anime({
            targets  : document.scrollingElement,
            duration : 500,
            easing   : 'linear',
            scrollTop: offset + 10
          });
          setTimeout(() => { skipActivate = false; }, 800);
          return;
        }
        if (clickTimer) {
          // 双击：跳转到对应内容（不展开上面）
          clearTimeout(clickTimer);
          clickTimer = null;
          var offset = target.getBoundingClientRect().top + window.scrollY;
          skipActivate = true;
          window.anime({
            targets  : document.scrollingElement,
            duration : 500,
            easing   : 'linear',
            scrollTop: offset + 10
          });
          setTimeout(() => { skipActivate = false; }, 800);
        } else {
          // 单击：延时判定，期间无第二次点击则触发 toggle
          clickTimer = setTimeout(() => {
            clickTimer = null;
            var child = element.querySelector(':scope > .nav-child');
            if (!child) return;
            if (element.classList.contains('active')) {
              // 收起：移除该项及所有后代的 active，并收起所有后代 nav-child
              element.classList.remove('active');
              element.querySelectorAll('li.active').forEach(el => el.classList.remove('active'));
              element.querySelectorAll('.nav-child').forEach(c => closeNav(c));
            } else {
              // 展开一层：仅该项 active（直接子级可见，更深层仍折叠）
              element.classList.add('active');
              openNav(child);
              // 滚动 TOC 让该项位于顶部，使展开的子目录与下方标题都留在可视区
              var offset = element.getBoundingClientRect().top - tocElement.getBoundingClientRect().top;
              if (Math.abs(offset) > 5) {
                window.anime({
                  targets  : tocElement,
                  duration : 200,
                  easing   : 'linear',
                  scrollTop: tocElement.scrollTop + offset - 10
                });
              }
            }
          }, 250);
        }
      });
      return target;
    });

    var tocElement = document.querySelector('.post-toc-wrap');
    // 展开/收起辅助：用 inline maxHeight = scrollHeight 驱动过渡（小值，过渡正常）
    // 嵌套展开/收起时同步刷新祖先 nav-child 的高度，避免内容被 max-height 裁掉
    function refreshAncestors(child) {
      var p = child.parentNode;
      while (p && !p.classList.contains('post-toc')) {
        if (p.classList.contains('nav-child')) {
          p.style.maxHeight = p.scrollHeight + 'px';
        }
        p = p.parentNode;
      }
    }
    function openNav(child) {
      var h = child.scrollHeight;
      if (child.style.maxHeight === h + 'px' && child.style.opacity === '1') return;
      child.style.maxHeight = child.style.maxHeight || '0px';
      void child.offsetHeight;
      anime({
        targets : child,
        maxHeight: h + 'px',
        opacity : 1,
        duration: 250,
        easing  : 'easeOutQuad',
        update  : () => refreshAncestors(child)
      });
    }
    function closeNav(child) {
      // 已折叠或不可见（如在已收起的祖先内）直接置 0，避免取 scrollHeight 把它再撑开造成空白
      if (child.offsetHeight === 0) {
        child.style.maxHeight = '0px';
        child.style.opacity = '0';
        child.style.paddingBottom = '0px';
        return;
      }
      var h = child.offsetHeight;
      child.style.maxHeight = h + 'px';
      void child.offsetHeight;
      anime({
        targets : child,
        maxHeight: '0px',
        opacity : 0,
        duration: 250,
        easing  : 'easeOutQuad',
        update  : () => refreshAncestors(child),
        complete: () => { child.style.paddingBottom = '0px'; refreshAncestors(child); }
      });
    }
    function activateNavByIndex(target) {
      if (target.classList.contains('active-current')) return;

      // 只切换当前高亮项（active-current），不清除其他项的 active 类，
      // 使已展开的目录在向下滚动时保持展开，仅"全部折叠"按钮或手动点击才会折叠。
      document.querySelectorAll('.post-toc .active-current').forEach(element => {
        element.classList.remove('active-current');
      });
      target.classList.add('active', 'active-current');
      // 跳转（叶子单击/标题双击）触发：只高亮当前项，不展开上面路径
      if (skipActivate) return;
      // 展开当前项到根的路径（祖先 nav-child），不展开当前项自身的子目录，也不展开同级兄弟分支。
      // 直接设高度而不用 openNav（避免多级 anime + refreshAncestors 相互覆盖产生空白）。
      var parent = target.parentNode;
      while (!parent.matches('.post-toc')) {
        if (parent.matches('li')) {
          parent.classList.add('active');
          var child = parent.querySelector(':scope > .nav-child');
          if (child) {
            child.style.maxHeight = child.scrollHeight + 'px';
            child.style.opacity = '1';
            child.style.paddingBottom = '5px';
          }
        }
        parent = parent.parentNode;
      }
      // Scrolling to center active TOC element if TOC content is taller then viewport.
      window.anime({
        targets  : tocElement,
        duration : 200,
        easing   : 'linear',
        scrollTop: tocElement.scrollTop - (tocElement.offsetHeight / 2) + target.getBoundingClientRect().top - tocElement.getBoundingClientRect().top
      });
    }

    function findIndex(entries) {
      let index = 0;
      let entry = entries[index];
      if (entry.boundingClientRect.top > 0) {
        index = sections.indexOf(entry.target);
        return index === 0 ? 0 : index - 1;
      }
      for (; index < entries.length; index++) {
        if (entries[index].boundingClientRect.top <= 0) {
          entry = entries[index];
        } else {
          return sections.indexOf(entry.target);
        }
      }
      return sections.indexOf(entry.target);
    }

    function createIntersectionObserver(marginTop) {
      marginTop = Math.floor(marginTop + 10000);
      let intersectionObserver = new IntersectionObserver((entries, observe) => {
        let scrollHeight = document.documentElement.scrollHeight + 100;
        if (scrollHeight > marginTop) {
          observe.disconnect();
          createIntersectionObserver(scrollHeight);
          return;
        }
        let index = findIndex(entries);
        activateNavByIndex(navItems[index]);
      }, {
        rootMargin: marginTop + 'px 0px -100% 0px',
        threshold : 0
      });
      sections.forEach(element => {
        element && intersectionObserver.observe(element);
      });
    }
    createIntersectionObserver(document.documentElement.scrollHeight);

    // 全部展开 / 全部折叠 按钮
    var expandAllBtn = document.querySelector('.post-toc-wrap .toc-expand-all');
    var collapseAllBtn = document.querySelector('.post-toc-wrap .toc-collapse-all');
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.post-toc li').forEach(element => {
          element.classList.add('active');
          var c = element.querySelector(':scope > .nav-child');
          if (c) openNav(c);
        });
      });
    }
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', () => {
        // 直接全部置 0，不逐个 anime（避免多个收起动画 + refreshAncestors 相互覆盖产生空白）
        document.querySelectorAll('.post-toc li').forEach(element => {
          element.classList.remove('active', 'active-current');
        });
        document.querySelectorAll('.post-toc .nav-child').forEach(c => {
          c.style.maxHeight = '0px';
          c.style.opacity = '0';
          c.style.paddingBottom = '0px';
        });
      });
    }
  },

  hasMobileUA: function() {
    let ua = navigator.userAgent;
    let pa = /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g;
    return pa.test(ua);
  },

  isTablet: function() {
    return window.screen.width < 992 && window.screen.width > 767 && this.hasMobileUA();
  },

  isMobile: function() {
    return window.screen.width < 767 && this.hasMobileUA();
  },

  isDesktop: function() {
    return !this.isTablet() && !this.isMobile();
  },

  supportsPDFs: function() {
    let ua = navigator.userAgent;
    let isFirefoxWithPDFJS = ua.includes('irefox') && parseInt(ua.split('rv:')[1].split('.')[0], 10) > 18;
    let supportsPdfMimeType = typeof navigator.mimeTypes['application/pdf'] !== 'undefined';
    let isIOS = /iphone|ipad|ipod/i.test(ua.toLowerCase());
    return isFirefoxWithPDFJS || (supportsPdfMimeType && !isIOS);
  },

  /**
   * Init Sidebar & TOC inner dimensions on all pages and for all schemes.
   * Need for Sidebar/TOC inner scrolling if content taller then viewport.
   */
  initSidebarDimension: function() {
    var sidebarNav = document.querySelector('.sidebar-nav');
    var sidebarNavHeight = sidebarNav.style.display !== 'none' ? sidebarNav.offsetHeight : 0;
    var sidebarOffset = CONFIG.sidebar.offset || 12;
    var sidebarb2tHeight = CONFIG.back2top.enable && CONFIG.back2top.sidebar ? document.querySelector('.back-to-top').offsetHeight : 0;
    var sidebarSchemePadding = (CONFIG.sidebar.padding * 2) + sidebarNavHeight + sidebarb2tHeight;
    // Margin of sidebar b2t: -4px -10px -18px, brings a different of 22px.
    if (CONFIG.scheme === 'Pisces' || CONFIG.scheme === 'Gemini') sidebarSchemePadding += (sidebarOffset * 2) - 22;
    // Initialize Sidebar & TOC Height.
    var sidebarWrapperHeight = document.body.offsetHeight - sidebarSchemePadding + 'px';
    document.querySelector('.site-overview-wrap').style.maxHeight = sidebarWrapperHeight;
    document.querySelector('.post-toc-wrap').style.maxHeight = sidebarWrapperHeight;
  },

  updateSidebarPosition: function() {
    var sidebarNav = document.querySelector('.sidebar-nav');
    var hasTOC = document.querySelector('.post-toc');
    if (hasTOC) {
      sidebarNav.style.display = '';
      sidebarNav.classList.add('motion-element');
      document.querySelector('.sidebar-nav-toc').click();
    } else {
      sidebarNav.style.display = 'none';
      sidebarNav.classList.remove('motion-element');
      document.querySelector('.sidebar-nav-overview').click();
    }
    NexT.utils.initSidebarDimension();
    if (!this.isDesktop() || CONFIG.scheme === 'Pisces' || CONFIG.scheme === 'Gemini') return;
    // Expand sidebar on post detail page by default, when post has a toc.
    var display = CONFIG.page.sidebar;
    if (typeof display !== 'boolean') {
      // There's no definition sidebar in the page front-matter.
      display = CONFIG.sidebar.display === 'always' || (CONFIG.sidebar.display === 'post' && hasTOC);
    }
    if (display) {
      window.dispatchEvent(new Event('sidebar:show'));
    }
  },

  getScript: function(url, callback, condition) {
    if (condition) {
      callback();
    } else {
      var script = document.createElement('script');
      script.onload = script.onreadystatechange = function(_, isAbort) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
          script.onload = script.onreadystatechange = null;
          script = undefined;
          if (!isAbort && callback) setTimeout(callback, 0);
        }
      };
      script.src = url;
      document.head.appendChild(script);
    }
  },

  loadComments: function(element, callback) {
    if (!CONFIG.comments.lazyload || !element) {
      callback();
      return;
    }
    let intersectionObserver = new IntersectionObserver((entries, observer) => {
      let entry = entries[0];
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
    intersectionObserver.observe(element);
    return intersectionObserver;
  }
};
