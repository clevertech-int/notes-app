import { OutputBlockData } from '@editorjs/editorjs';
import './convert-content-to-html.less';

type ListItemType = {
  content: string;
  items: ListItemType[];
};

type ChecklistItem = {
  text: string;
  checked: boolean;
};

const convertToId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

const warningIcon = `<svg xmlns='http://www.w3.org/2000/svg' width="32" height="32" viewBox='0 0 24 24' stroke="#ffb700" stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M12 9v2m0 4v.01' /><path d='M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75' /></svg>`;

const loadList = (items: ListItemType[], style: string) => {
  let html = '';

  items.forEach((item) => {
    html += `<li><div>${item.content}`;
    if (item.items.length > 0) {
      html += style === 'unordered' ? '<ul>' : '<ol>';
      html += loadList(item.items, style);
      html += style === 'unordered' ? '</ul>' : '</ol>';
    }
    html += `</div></li>`;
  });
  return html;
};

const loadTable = (content: string[][], withHeadings?: boolean) => {
  let html = '<table>';

  if (withHeadings) {
    html += '<thead>';
  } else {
    html += '<tbody>';
  }

  content.forEach((row, index) => {
    if (withHeadings && index === 0) {
      html += '<thead><tr>';
      row.forEach((column) => {
        html += `<th>${column}</th>`;
      });
      html += '</tr></thead><tbody>';
    } else {
      html += '<tr>';
      row.forEach((column) => {
        html += `<td>${column}</td>`;
      });
      html += '</tr>';
    }
  });

  html += '</tbody></table>';
  return html;
};

const loadChecklist = (items: ChecklistItem[]) => {
  let html = '<div>';

  items.forEach((item) => {
    html += `<div class="checklist-item"><input type="checkbox" disabled${
      item.checked ? ' checked ' : ''
    }/><label>${item.text}</label></div>`;
  });

  html += '</div>';
  return html;
};

export const convertContentToHtml = (blocks?: OutputBlockData<string, any>[]) => {
  let convertedHtml = '';
  blocks?.forEach((block) => {
    switch (block.type) {
      case 'header':
      case 'subtitle':
        convertedHtml += `<h${block.data.level} id="${
          block.data.id || convertToId(block.data.text)
        }">${block.data.text}</h${block.data.level}>`;
        break;
      case 'embed':
        convertedHtml += `<div class="page-embed"><iframe width="100%" height="100%" src="${block.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
        if (block.data.caption) {
          convertedHtml += `<p>${block.data.caption}</p>`;
        }
        break;
      case 'paragraph':
        convertedHtml += `<p>${block.data.text}</p>`;
        break;
      case 'delimiter':
        convertedHtml += '<hr />';
        break;
      case 'image':
        convertedHtml += `<div class="img-fluid${
          block.data.withBackground ? ' withBackground' : ''
        }${block.data.withBorder ? ' withBorder' : ''}${
          block.data.stretched ? ' stretched' : ''
        }"><img src="${block.data.file?.url}" title="${
          block.data.caption
        }" /></div><em class="img-caption">${block.data.caption}</em>`;
        break;
      case 'ordered':
      case 'list':
        convertedHtml += block.data.style === 'unordered' ? '<ul>' : '<ol>';
        convertedHtml += loadList(block.data.items, block.data.style);
        convertedHtml += block.data.style === 'unordered' ? '</ul>' : '</ol>';
        break;
      case 'quote':
        convertedHtml += `<blockquote class="${block.data.alignment}" cite="${block.data.caption}">${block.data.text}<p>${block.data.caption}</p></blockquote>`;
        break;
      case 'warning':
        convertedHtml += `<div class="warning-container"><div class="warning-icon">${warningIcon}</div><div><p class="warning-title">${block.data.title}</p><p class="warning-message">${block.data.message}</p></div></div>`;
        break;
      case 'code':
        convertedHtml += `<div class="block-code"><code>${block.data.code}</code></div>`;
        break;
      case 'table':
        convertedHtml += loadTable(block.data.content, block.data.withHeadings);
        break;
      case 'raw':
        convertedHtml += `<div>${block.data.html}</div>`;
        break;
      case 'checklist':
        convertedHtml += loadChecklist(block.data.items);
        break;
      default:
        break;
    }
  });
  return convertedHtml;
};

export default convertContentToHtml;
