-- Use the PDF version of each SVG figure in the LaTeX build.
function Image(img)
  if img.src:match('%.svg$') then img.src = 'build/' .. img.src:gsub('^figures/', ''):gsub('%.svg$', '.pdf') end
  return img
end
