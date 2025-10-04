import svgPaths from "./svg-msy1cdb2t";

function WordMarkRed() {
  return (
    <div className="absolute bottom-[1.01%] contents left-0 right-[0.28%] top-0" data-name="WordMark-Red">
      <div className="absolute bottom-[1.01%] left-0 right-[0.28%] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 24">
          <path clipRule="evenodd" d={svgPaths.p2dfb9880} fill="var(--fill-0, #FF2929)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[23.991px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <WordMarkRed />
    </div>
  );
}

function WordMarkRed1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[23.991px] items-start left-0 top-[10px] w-[95.994px]" data-name="WordMarkRed">
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[10px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p265fbb80} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M12.6622 7.99716H3.33215" id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function AppContent() {
  return (
    <div className="absolute h-[20px] left-[35.98px] top-[5.99px] w-[123.537px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#717182] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Back to Simulators</p>
      </div>
    </div>
  );
}

function AppContent1() {
  return (
    <div className="absolute left-[-160.17px] size-0 top-[-21.99px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#717182] text-[14px] top-[-1px] tracking-[-0.1504px] w-0">
        <p className="leading-[20px]">Back</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[31.989px] relative rounded-[8px] shrink-0 w-[169.517px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[169.517px]">
        <Icon1 />
        <AppContent />
        <AppContent1 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[0.909px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[23.991px] w-[0.909px]" />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
        <p className="leading-[24px] whitespace-pre">{`Issuing & Processing Simulator`}</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Configure your card payment solution and calculate costs</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[43.992px] relative shrink-0 w-[371.151px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[43.992px] items-start relative w-[371.151px]">
        <Heading1 />
        <Paragraph />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex gap-[11.989px] h-[43.992px] items-center left-[111.99px] top-0 w-[565.554px]" data-name="Container">
      <Button />
      <Container />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[43.992px] relative shrink-0 w-[677.543px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[43.992px] relative w-[677.543px]">
        <WordMarkRed1 />
        <Container2 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_173_1262)" id="Icon">
          <path d={svgPaths.p1aaaa600} id="Vector" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d={svgPaths.p1bffbec0} id="Vector_2" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M6.6643 5.99787H5.33144" id="Vector_3" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M10.6629 8.66359H5.33144" id="Vector_4" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M10.6629 11.3293H5.33144" id="Vector_5" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
        <defs>
          <clipPath id="clip0_173_1262">
            <rect fill="white" height="15.9943" width="15.9943" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AppContent2() {
  return (
    <div className="absolute h-[20px] left-[40.9px] top-[5.99px] w-[120.895px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#ca3500] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">PDF (Missing Info)</p>
      </div>
    </div>
  );
}

function AppContent3() {
  return (
    <div className="absolute left-[-883.88px] size-0 top-[-21.99px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#ca3500] text-[14px] top-[-1px] tracking-[-0.1504px] w-0">
        <p className="leading-[20px]">PDF</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-white h-[31.989px] left-0 rounded-[8px] top-0 w-[172.699px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#ffb86a] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon2 />
      <AppContent2 />
      <AppContent3 />
    </div>
  );
}

function AppContent4() {
  return (
    <div className="absolute h-[20px] left-[12.9px] top-[5.99px] w-[96.335px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Clear Scenario</p>
      </div>
    </div>
  );
}

function AppContent5() {
  return (
    <div className="absolute left-[-1064.57px] size-0 top-[-21.99px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 top-[-1px] tracking-[-0.1504px] w-0">
        <p className="leading-[20px]">Clear</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white h-[31.989px] left-[180.7px] rounded-[8px] top-0 w-[122.131px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <AppContent4 />
      <AppContent5 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_173_1272)" id="Icon">
          <path d={svgPaths.p32260300} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d={svgPaths.p1f301500} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
        <defs>
          <clipPath id="clip0_173_1272">
            <rect fill="white" height="15.9943" width="15.9943" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AppContent6() {
  return (
    <div className="absolute h-[20px] left-[40.9px] top-[5.99px] w-[81.676px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Admin Panel</p>
      </div>
    </div>
  );
}

function AppContent7() {
  return (
    <div className="absolute left-[-1194.7px] size-0 top-[-21.99px]" data-name="AppContent">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 top-[-1px] tracking-[-0.1504px] w-0">
        <p className="leading-[20px]">Admin</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-white h-[31.989px] left-[310.82px] rounded-[8px] top-0 w-[133.48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon3 />
      <AppContent6 />
      <AppContent7 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[31.989px] relative shrink-0 w-[444.304px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[444.304px]">
        <Button1 />
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex h-[43.992px] items-center justify-between left-[48.18px] top-[15.99px] w-[1280px]" data-name="Container">
      <Container3 />
      <Container4 />
    </div>
  );
}

function CardTitle() {
  return (
    <div className="absolute h-[15.994px] left-0 top-0 w-[154.389px]" data-name="CardTitle">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-0.82px] tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">Client Configuration</p>
      </div>
    </div>
  );
}

function CardDescription() {
  return (
    <div className="absolute h-[23.991px] left-0 top-[15.99px] w-[154.389px]" data-name="CardDescription">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[16px] top-[-1.18px] tracking-[-0.3125px] w-[155px]">
        <p className="leading-[24px]">3 configuration cards</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[39.986px] relative shrink-0 w-[154.389px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[39.986px] relative w-[154.389px]">
        <CardTitle />
        <CardDescription />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon4 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function DynamicClientConfigBar() {
  return (
    <div className="absolute content-stretch flex h-[39.986px] items-center justify-between left-[23.99px] top-[23.99px] w-[1230.2px]" data-name="DynamicClientConfigBar">
      <Container6 />
      <Button4 />
    </div>
  );
}

function CardHeader() {
  return (
    <div className="h-[94.872px] relative shrink-0 w-[1278.18px]" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[94.872px] relative w-[1278.18px]">
        <DynamicClientConfigBar />
      </div>
    </div>
  );
}

function CardTitle1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="CardTitle">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">General Information</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-[165.27px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-[165.27px]" style={{ gap: "5.72205e-06px" }}>
        <CardTitle1 />
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[12px] tracking-[-0.3125px] w-[166px]">
          <p className="leading-[22px]">0 fields filled</p>
        </div>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon5 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function ItemLibrary() {
  return (
    <div className="relative shrink-0 w-full" data-name="ItemLibrary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container7 />
          <Button5 />
        </div>
      </div>
    </div>
  );
}

function CardHeader1() {
  return (
    <div className="relative shrink-0 w-full" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start px-[24px] py-[12px] relative w-full">
          <ItemLibrary />
        </div>
      </div>
    </div>
  );
}

function DynamicClientConfigBar1() {
  return (
    <div className="absolute h-[20px] left-[92.54px] top-0 w-[6.52px]" data-name="DynamicClientConfigBar">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#d4183d] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">*</p>
      </div>
    </div>
  );
}

function PrimitiveLabel() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Primitive.label">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Client Name</p>
      </div>
      <DynamicClientConfigBar1 />
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">Enter client name</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar2() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel />
      <Input />
    </div>
  );
}

function DynamicClientConfigBar3() {
  return (
    <div className="absolute h-[20px] left-[101.08px] top-0 w-[6.52px]" data-name="DynamicClientConfigBar">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#d4183d] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">*</p>
      </div>
    </div>
  );
}

function PrimitiveLabel1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Primitive.label">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Project Name</p>
      </div>
      <DynamicClientConfigBar3 />
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">Enter project name</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar4() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel1 />
      <Input1 />
    </div>
  );
}

function DynamicClientConfigBar5() {
  return (
    <div className="absolute h-[20px] left-[92.91px] top-0 w-[6.52px]" data-name="DynamicClientConfigBar">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[#d4183d] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">*</p>
      </div>
    </div>
  );
}

function PrimitiveLabel2() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Primitive.label">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Prepared By</p>
      </div>
      <DynamicClientConfigBar5 />
    </div>
  );
}

function Input2() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">Enter prepared by</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar6() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel2 />
      <Input2 />
    </div>
  );
}

function CardContent() {
  return (
    <div className="h-[251.932px] relative shrink-0 w-full" data-name="CardContent">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[15.994px] h-[251.932px] items-start pb-0 pt-[15.994px] px-[23.991px] relative w-full">
          <DynamicClientConfigBar2 />
          <DynamicClientConfigBar4 />
          <DynamicClientConfigBar6 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveDiv() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[397.585px]" data-name="Primitive.div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start relative w-[397.585px]" style={{ gap: "1.52588e-05px" }}>
        <CardHeader1 />
        <CardContent />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[324.631px] items-start left-[-0.08px] p-[0.909px] rounded-[14px] top-[0.26px] w-[399.403px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <PrimitiveDiv />
    </div>
  );
}

function CardTitle2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="CardTitle">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">Card Configuration</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-[165.27px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-[165.27px]" style={{ gap: "5.72205e-06px" }}>
        <CardTitle2 />
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[12px] tracking-[-0.3125px] w-[166px]">
          <p className="leading-[22px]">0 fields filled</p>
        </div>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon6 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function ItemLibrary1() {
  return (
    <div className="relative shrink-0 w-full" data-name="ItemLibrary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container8 />
          <Button6 />
        </div>
      </div>
    </div>
  );
}

function CardHeader2() {
  return (
    <div className="relative shrink-0 w-full" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start px-[24px] py-[12px] relative w-full">
          <ItemLibrary1 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveLabel3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Number of Debit Cards</p>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">0</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar7() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel3 />
      <Input3 />
    </div>
  );
}

function PrimitiveLabel4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Number of Virtual Cards</p>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">0</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar8() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel4 />
      <Input4 />
    </div>
  );
}

function PrimitiveLabel5() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Number of Credit Cards</p>
      </div>
    </div>
  );
}

function Input5() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">0</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar9() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel5 />
      <Input5 />
    </div>
  );
}

function CardContent1() {
  return (
    <div className="h-[251.932px] relative shrink-0 w-full" data-name="CardContent">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[15.994px] h-[251.932px] items-start pb-0 pt-[15.994px] px-[23.991px] relative w-full">
          <DynamicClientConfigBar7 />
          <DynamicClientConfigBar8 />
          <DynamicClientConfigBar9 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveDiv1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[397.585px]" data-name="Primitive.div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start relative w-[397.585px]" style={{ gap: "1.52588e-05px" }}>
        <CardHeader2 />
        <CardContent1 />
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[324.631px] items-start left-[415.4px] p-[0.909px] rounded-[14px] top-0 w-[399.403px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <PrimitiveDiv1 />
    </div>
  );
}

function CardTitle3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="CardTitle">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">Transactions</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-[165.27px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-[165.27px]" style={{ gap: "5.72205e-06px" }}>
        <CardTitle3 />
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[12px] tracking-[-0.3125px] w-[166px]">
          <p className="leading-[22px]">0 fields filled</p>
        </div>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon7 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function ItemLibrary2() {
  return (
    <div className="relative shrink-0 w-full" data-name="ItemLibrary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container9 />
          <Button7 />
        </div>
      </div>
    </div>
  );
}

function CardHeader3() {
  return (
    <div className="relative shrink-0 w-full" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start px-[24px] py-[12px] relative w-full">
          <ItemLibrary2 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveLabel6() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Number of Transactions</p>
      </div>
    </div>
  );
}

function Input6() {
  return (
    <div className="bg-[#f3f3f5] h-[31.989px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip size-full">
        <div className="box-border content-stretch flex h-[31.989px] items-center px-[12px] py-[4px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
            <p className="leading-[normal] whitespace-pre">0</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DynamicClientConfigBar10() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-start relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <PrimitiveLabel6 />
      <Input6 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[99.972px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col h-[99.972px] items-start pb-0 pt-[15.994px] px-[23.991px] relative w-full">
          <DynamicClientConfigBar10 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveDiv2() {
  return (
    <div className="h-[170.852px] relative shrink-0 w-[397.585px]" data-name="Primitive.div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[170.852px] items-start relative w-[397.585px]" style={{ gap: "1.52588e-05px" }}>
        <CardHeader3 />
        <Container10 />
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[324.631px] items-start left-[830.79px] p-[0.909px] rounded-[14px] top-0 w-[399.403px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <PrimitiveDiv2 />
    </div>
  );
}

function DynamicClientConfigBar11() {
  return (
    <div className="h-[324.631px] relative shrink-0 w-full" data-name="DynamicClientConfigBar">
      <Card />
      <Card1 />
      <Card2 />
    </div>
  );
}

function PrimitiveDiv3() {
  return (
    <div className="h-[372.614px] relative shrink-0 w-[1278.18px]" data-name="Primitive.div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[372.614px] items-start overflow-clip pb-0 pt-[23.991px] px-[23.991px] relative w-[1278.18px]">
        <DynamicClientConfigBar11 />
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[23.991px] h-[493.295px] items-start left-[48.18px] p-[0.909px] rounded-[14px] top-[75.98px] w-[1280px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardHeader />
      <PrimitiveDiv3 />
    </div>
  );
}

function CardTitle4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="CardTitle">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">Service Library</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-[165.27px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-[165.27px]" style={{ gap: "5.72205e-06px" }}>
        <CardTitle4 />
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[12px] tracking-[-0.3125px] w-[166px]">
          <p className="leading-[22px]">0 selected · 5 available</p>
        </div>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon8 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function ItemLibrary3() {
  return (
    <div className="relative shrink-0 w-full" data-name="ItemLibrary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container11 />
          <Button8 />
        </div>
      </div>
    </div>
  );
}

function CardHeader4() {
  return (
    <div className="relative shrink-0 w-full" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] items-start px-[24px] py-[12px] relative w-full">
          <ItemLibrary3 />
        </div>
      </div>
    </div>
  );
}

function Input7() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[35.994px] left-0 rounded-[8px] top-0 w-[366.193px]" data-name="Input">
      <div className="box-border content-stretch flex h-[35.994px] items-center overflow-clip pl-[36px] pr-[12px] py-[4px] relative w-[366.193px]">
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">
          <p className="leading-[normal] whitespace-pre">Search services by name, description, or tags...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-[11.99px] size-[15.994px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p24791400} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d={svgPaths.p2139fb00} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function ItemLibrary4() {
  return (
    <div className="h-[35.994px] relative shrink-0 w-full" data-name="ItemLibrary">
      <Input7 />
      <Icon9 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[20px] left-[12.9px] top-[12.9px] w-[85.81px]" data-name="Text">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Filter by tags</p>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-0 rounded-[8px] top-0 w-[38.281px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[38.281px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">BIN</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge1() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[42.27px] rounded-[8px] top-0 w-[43.551px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[43.551px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">card</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge2() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[89.81px] rounded-[8px] top-0 w-[60.98px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[60.98px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">hosting</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge3() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[154.79px] rounded-[8px] top-0 w-[72.67px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[72.67px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">migration</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge4() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[231.45px] rounded-[8px] top-0 w-[83.594px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[83.594px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">onboarding</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge5() {
  return (
    <div className="absolute bg-[#eceef2] h-[23.991px] left-0 rounded-[8px] top-[25.78px] w-[70.043px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[23.991px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[70.043px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">one-time</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute box-border content-stretch flex gap-[6px] h-[23.991px] items-center justify-center left-[74.03px] px-[8px] py-0 rounded-[8px] top-[25.78px] w-[64.19px]" data-name="Button">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
        <p className="leading-[16px] whitespace-pre">+3 more</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[49.773px] left-[12.9px] top-[40.9px] w-[340.398px]" data-name="Container">
      <Badge />
      <Badge1 />
      <Badge2 />
      <Badge3 />
      <Badge4 />
      <Badge5 />
      <Button9 />
    </div>
  );
}

function ItemLibrary5() {
  return (
    <div className="h-[103.565px] relative rounded-[10px] shrink-0 w-full" data-name="ItemLibrary">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Text />
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[87.457px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[23.991px] relative w-[87.457px]">
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
          <p className="leading-[24px] whitespace-pre">Initial Setup</p>
        </div>
      </div>
    </div>
  );
}

function Badge6() {
  return (
    <div className="bg-[#eceef2] h-[21.79px] relative rounded-[8px] shrink-0 w-[25.213px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[25.213px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">2</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[120.668px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.997px] h-[23.991px] items-center relative w-[120.668px]">
        <Container13 />
        <Badge6 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[15.994px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function ItemLibrary6() {
  return (
    <div className="absolute box-border content-stretch flex h-[47.969px] items-center justify-between left-0 px-[11.989px] py-0 top-0 w-[364.375px]" data-name="ItemLibrary">
      <Container14 />
      <Icon10 />
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="h-[47.969px] relative shrink-0 w-full" data-name="Primitive.button">
      <ItemLibrary6 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
        <p className="leading-[24px] whitespace-pre">New Customer Onboarding</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[40px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] top-[0.82px] tracking-[-0.1504px] w-[210px]">
        <p className="leading-[20px]">Complete setup process for new customers</p>
      </div>
    </div>
  );
}

function Badge7() {
  return (
    <div className="absolute h-[21.79px] left-0 rounded-[8px] top-0 w-[70.043px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[70.043px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">one-time</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge8() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[78.04px] rounded-[8px] top-0 w-[50.455px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[50.455px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">setup</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge9() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[136.49px] rounded-[8px] top-0 w-[83.594px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[83.594px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">onboarding</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge10() {
  return (
    <div className="absolute h-[21.79px] left-0 rounded-[8px] top-[29.79px] w-[31.307px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[31.307px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">+1</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[51.577px] relative shrink-0 w-full" data-name="Container">
      <Badge7 />
      <Badge8 />
      <Badge9 />
      <Badge10 />
    </div>
  );
}

function Container18() {
  return (
    <div className="basis-0 grow h-[127.557px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.991px] h-[127.557px] items-start relative w-full">
        <Container15 />
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[20px] relative shrink-0 w-[77.131px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[77.131px]">
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">$55,000.00</p>
        </div>
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33215 7.99716H12.6622" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M7.99716 3.33215V12.6622" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[74.19px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[74.19px]">
        <Icon11 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[14px] text-neutral-950 text-nowrap top-[6.81px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">Add</p>
        </div>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[59.986px] relative shrink-0 w-[77.131px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-end relative w-[77.131px]">
        <Container19 />
        <Button10 />
      </div>
    </div>
  );
}

function ItemLibrary7() {
  return (
    <div className="h-[127.557px] relative shrink-0 w-[322.585px]" data-name="ItemLibrary">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[127.557px] items-start justify-between relative w-[322.585px]">
        <Container18 />
        <Container20 />
      </div>
    </div>
  );
}

function Card4() {
  return (
    <div className="bg-white h-[165.355px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[165.355px] items-start pb-[0.909px] pl-[12.898px] pr-[0.909px] pt-[12.898px] relative w-full">
          <ItemLibrary7 />
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
        <p className="leading-[24px] whitespace-pre">BIN Set up</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[40px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] top-[0.82px] tracking-[-0.1504px] w-[194px]">
        <p className="leading-[20px]">Per BIN migration for Visa and Mastercard</p>
      </div>
    </div>
  );
}

function Badge11() {
  return (
    <div className="absolute h-[21.79px] left-0 rounded-[8px] top-0 w-[82.77px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[82.77px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">per change</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge12() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[90.77px] rounded-[8px] top-0 w-[50.455px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[50.455px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">setup</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge13() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[149.22px] rounded-[8px] top-0 w-[38.281px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[38.281px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">BIN</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge14() {
  return (
    <div className="absolute h-[21.79px] left-[195.5px] rounded-[8px] top-0 w-[31.307px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[31.307px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">+1</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[21.79px] relative shrink-0 w-full" data-name="Container">
      <Badge11 />
      <Badge12 />
      <Badge13 />
      <Badge14 />
    </div>
  );
}

function Container24() {
  return (
    <div className="basis-0 grow h-[97.77px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.992px] h-[97.77px] items-start relative w-full">
        <Container21 />
        <Container22 />
        <Container23 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[20px] relative shrink-0 w-[68.409px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[68.409px]">
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">$5,000.00</p>
        </div>
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33215 7.99716H12.6622" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M7.99716 3.33215V12.6622" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[74.19px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[74.19px]">
        <Icon12 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[14px] text-neutral-950 text-nowrap top-[6.81px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">Add</p>
        </div>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[59.986px] relative shrink-0 w-[74.19px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-end relative w-[74.19px]">
        <Container25 />
        <Button11 />
      </div>
    </div>
  );
}

function ItemLibrary8() {
  return (
    <div className="h-[97.77px] relative shrink-0 w-[322.585px]" data-name="ItemLibrary">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[97.77px] items-start justify-between relative w-[322.585px]">
        <Container24 />
        <Container26 />
      </div>
    </div>
  );
}

function Card5() {
  return (
    <div className="bg-white h-[135.568px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[135.568px] items-start pb-[0.909px] pl-[12.898px] pr-[0.909px] pt-[12.898px] relative w-full">
          <ItemLibrary8 />
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[325.824px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.997px] h-[325.824px] items-start pb-0 pt-[8.906px] px-[7.997px] relative w-full">
          <Card4 />
          <Card5 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[375.611px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[375.611px] items-start p-[0.909px] relative w-full">
          <PrimitiveButton />
          <Container27 />
        </div>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[213.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[23.991px] relative w-[213.906px]">
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
          <p className="leading-[24px] whitespace-pre">{`Card Management & Hosting`}</p>
        </div>
      </div>
    </div>
  );
}

function Badge15() {
  return (
    <div className="bg-[#eceef2] h-[21.79px] relative rounded-[8px] shrink-0 w-[25.213px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[25.213px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">2</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[247.116px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.997px] h-[23.991px] items-center relative w-[247.116px]">
        <Container29 />
        <Badge15 />
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[15.994px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function ItemLibrary9() {
  return (
    <div className="absolute box-border content-stretch flex h-[47.969px] items-center justify-between left-0 px-[11.989px] py-0 top-0 w-[364.375px]" data-name="ItemLibrary">
      <Container30 />
      <Icon13 />
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="h-[47.969px] relative shrink-0 w-full" data-name="Primitive.button">
      <ItemLibrary9 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
        <p className="leading-[24px] whitespace-pre">Card Creation</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">Fee for creating new cards</p>
      </div>
    </div>
  );
}

function Badge16() {
  return (
    <div className="absolute h-[21.79px] left-0 rounded-[8px] top-0 w-[66.065px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[66.065px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">per card</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge17() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[74.06px] rounded-[8px] top-0 w-[43.551px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[43.551px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">card</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[21.79px] relative shrink-0 w-full" data-name="Container">
      <Badge16 />
      <Badge17 />
    </div>
  );
}

function Container34() {
  return (
    <div className="basis-0 grow h-[77.77px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.991px] h-[77.77px] items-start relative w-full">
        <Container31 />
        <Container32 />
        <Container33 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[20px] relative shrink-0 w-[38.608px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[38.608px]">
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-[0.82px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">$0.20</p>
        </div>
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33215 7.99716H12.6622" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M7.99716 3.33215V12.6622" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[74.19px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[74.19px]">
        <Icon14 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[14px] text-neutral-950 text-nowrap top-[6.81px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">Add</p>
        </div>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[59.986px] relative shrink-0 w-[74.19px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[7.997px] h-[59.986px] items-end relative w-[74.19px]">
        <Container35 />
        <Button12 />
      </div>
    </div>
  );
}

function ItemLibrary10() {
  return (
    <div className="h-[77.77px] relative shrink-0 w-[322.585px]" data-name="ItemLibrary">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[77.77px] items-start justify-between relative w-[322.585px]">
        <Container34 />
        <Container36 />
      </div>
    </div>
  );
}

function Card6() {
  return (
    <div className="bg-white h-[115.568px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[115.568px] items-start pb-[0.909px] pl-[12.898px] pr-[0.909px] pt-[12.898px] relative w-full">
          <ItemLibrary10 />
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[47.983px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 top-[-1.18px] tracking-[-0.3125px] w-[167px]">
        <p className="leading-[24px]">Card Hosting (Debit/Prepaid/Virtual)</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[40px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] top-[0.82px] tracking-[-0.1504px] w-[231px]">
        <p className="leading-[20px]">Monthly hosting fee for virtual debit or prepaid cards</p>
      </div>
    </div>
  );
}

function Badge18() {
  return (
    <div className="absolute h-[21.79px] left-0 rounded-[8px] top-0 w-[66.065px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[66.065px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">per card</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge19() {
  return (
    <div className="absolute bg-[#030213] h-[21.79px] left-[74.06px] rounded-[8px] top-0 w-[98.168px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[98.168px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white">
          <p className="leading-[16px] whitespace-pre">Tiered Pricing</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge20() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[180.23px] rounded-[8px] top-0 w-[43.551px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[43.551px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">card</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge21() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-0 rounded-[8px] top-[29.79px] w-[60.98px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[60.98px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">hosting</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[51.577px] relative shrink-0 w-full" data-name="Container">
      <Badge18 />
      <Badge19 />
      <Badge20 />
      <Badge21 />
    </div>
  );
}

function Container40() {
  return (
    <div className="basis-0 grow h-[151.548px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.992px] h-[151.548px] items-start relative w-full">
        <Container37 />
        <Container38 />
        <Container39 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#717182] text-[12px] text-right">
        <p className="leading-[16px]">from</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[39px] not-italic text-[14px] text-neutral-950 text-nowrap text-right top-[0.82px] tracking-[-0.1504px] translate-x-[-100%]">
        <p className="leading-[20px] whitespace-pre">$0.35</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[39.986px] relative shrink-0 w-[38.565px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.992px] h-[39.986px] items-start relative w-[38.565px]">
        <Container41 />
        <Container42 />
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33215 7.99716H12.6622" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M7.99716 3.33215V12.6622" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[74.19px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[74.19px]">
        <Icon15 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[14px] text-neutral-950 text-nowrap top-[6.81px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">Add</p>
        </div>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[79.972px] relative shrink-0 w-[74.19px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[7.997px] h-[79.972px] items-end relative w-[74.19px]">
        <Container43 />
        <Button13 />
      </div>
    </div>
  );
}

function ItemLibrary11() {
  return (
    <div className="h-[151.548px] relative shrink-0 w-[322.585px]" data-name="ItemLibrary">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[151.548px] items-start justify-between relative w-[322.585px]">
        <Container40 />
        <Container44 />
      </div>
    </div>
  );
}

function Card7() {
  return (
    <div className="bg-white h-[189.347px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[189.347px] items-start pb-[0.909px] pl-[12.898px] pr-[0.909px] pt-[12.898px] relative w-full">
          <ItemLibrary11 />
        </div>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[329.815px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.997px] h-[329.815px] items-start pb-0 pt-[8.906px] px-[7.997px] relative w-full">
          <Card6 />
          <Card7 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[379.602px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[379.602px] items-start p-[0.909px] relative w-full">
          <PrimitiveButton1 />
          <Container45 />
        </div>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[173.196px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[23.991px] relative w-[173.196px]">
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
          <p className="leading-[24px] whitespace-pre">Transaction Processing</p>
        </div>
      </div>
    </div>
  );
}

function Badge22() {
  return (
    <div className="bg-[#eceef2] h-[21.79px] relative rounded-[8px] shrink-0 w-[23.579px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[23.579px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">1</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[204.773px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.997px] h-[23.991px] items-center relative w-[204.773px]">
        <Container47 />
        <Badge22 />
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[15.994px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function ItemLibrary12() {
  return (
    <div className="absolute box-border content-stretch flex h-[47.969px] items-center justify-between left-0 px-[11.989px] py-0 top-0 w-[364.375px]" data-name="ItemLibrary">
      <Container48 />
      <Icon16 />
    </div>
  );
}

function PrimitiveButton2() {
  return (
    <div className="absolute h-[47.969px] left-[0.91px] top-[0.91px] w-[364.375px]" data-name="Primitive.button">
      <ItemLibrary12 />
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-[-1.18px] tracking-[-0.3125px]">
        <p className="leading-[24px] whitespace-pre">Transaction Processing OFF US</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[40px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] top-[0.82px] tracking-[-0.1504px] w-[221px]">
        <p className="leading-[20px]">Processing fee for transactions at external/third-party POS terminals</p>
      </div>
    </div>
  );
}

function Badge23() {
  return (
    <div className="absolute h-[21.79px] left-0 rounded-[8px] top-0 w-[105.81px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[105.81px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-950 text-nowrap">
          <p className="leading-[16px] whitespace-pre">per transaction</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge24() {
  return (
    <div className="absolute bg-[#030213] h-[21.79px] left-[113.81px] rounded-[8px] top-0 w-[98.168px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[98.168px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-white">
          <p className="leading-[16px] whitespace-pre">Tiered Pricing</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge25() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-0 rounded-[8px] top-[29.79px] w-[83.295px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[83.295px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">transaction</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge26() {
  return (
    <div className="absolute bg-[#eceef2] h-[21.79px] left-[91.29px] rounded-[8px] top-[29.79px] w-[81.463px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[21.79px] items-center justify-center overflow-clip px-[8.909px] py-[2.909px] relative w-[81.463px]">
        <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">
          <p className="leading-[16px] whitespace-pre">processing</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[51.577px] relative shrink-0 w-full" data-name="Container">
      <Badge23 />
      <Badge24 />
      <Badge25 />
      <Badge26 />
    </div>
  );
}

function Container52() {
  return (
    <div className="basis-0 grow h-[127.557px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.991px] h-[127.557px] items-start relative w-full">
        <Container49 />
        <Container50 />
        <Container51 />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#717182] text-[12px] text-right">
        <p className="leading-[16px]">from</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[48px] not-italic text-[14px] text-neutral-950 text-nowrap text-right top-[0.82px] tracking-[-0.1504px] translate-x-[-100%]">
        <p className="leading-[20px] whitespace-pre">$0.035</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[39.986px] relative shrink-0 w-[47.273px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.991px] h-[39.986px] items-start relative w-[47.273px]">
        <Container53 />
        <Container54 />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33215 7.99716H12.6622" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
          <path d="M7.99716 3.33215V12.6622" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[74.19px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[74.19px]">
        <Icon17 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[14px] text-neutral-950 text-nowrap top-[6.81px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">Add</p>
        </div>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="h-[79.972px] relative shrink-0 w-[74.19px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[7.997px] h-[79.972px] items-end relative w-[74.19px]">
        <Container55 />
        <Button14 />
      </div>
    </div>
  );
}

function ItemLibrary13() {
  return (
    <div className="h-[127.557px] relative shrink-0 w-[322.585px]" data-name="ItemLibrary">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[127.557px] items-start justify-between relative w-[322.585px]">
        <Container52 />
        <Container56 />
      </div>
    </div>
  );
}

function Card8() {
  return (
    <div className="bg-white h-[165.355px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[165.355px] items-start pb-[0.909px] pl-[12.898px] pr-[0.909px] pt-[12.898px] relative w-full">
          <ItemLibrary13 />
        </div>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute h-[182.259px] left-[0.91px] top-[48.88px] w-[364.375px]" data-name="Container">
      <div className="box-border content-stretch flex flex-col h-[182.259px] items-start overflow-clip pb-0 pt-[8.906px] px-[7.997px] relative w-[364.375px]">
        <Card8 />
      </div>
      <div aria-hidden="true" className="absolute border-[0.909px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[232.045px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <PrimitiveButton2 />
      <Container57 />
    </div>
  );
}

function ItemLibrary14() {
  return (
    <div className="content-stretch flex flex-col gap-[11.989px] h-[1011.24px] items-start relative shrink-0 w-full" data-name="ItemLibrary">
      <Container28 />
      <Container46 />
      <Container58 />
    </div>
  );
}

function CardContent2() {
  return (
    <div className="h-[1206.78px] relative shrink-0 w-[414.176px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[15.994px] h-[1206.78px] items-start px-[23.991px] py-0 relative w-[414.176px]">
        <ItemLibrary4 />
        <ItemLibrary5 />
        <ItemLibrary14 />
      </div>
    </div>
  );
}

function Card9() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[23.991px] h-[1327.46px] items-start left-0 p-[0.909px] rounded-[14px] top-0 w-[415.994px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardHeader4 />
      <CardContent2 />
    </div>
  );
}

function CardTitle5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="CardTitle">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">Selected Services</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="relative shrink-0 w-[165.27px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-[165.27px]" style={{ gap: "5.72205e-06px" }}>
        <CardTitle5 />
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[12px] tracking-[-0.3125px] w-[166px]">
          <p className="leading-[22px]">0 items selected</p>
        </div>
      </div>
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon18 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function ItemLibrary15() {
  return (
    <div className="relative shrink-0 w-full" data-name="ItemLibrary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container59 />
          <Button15 />
        </div>
      </div>
    </div>
  );
}

function CardHeader5() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[8px] items-start px-[24px] py-[12px] relative shrink-0 w-[414.176px]" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <ItemLibrary15 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[183.93px] not-italic text-[#717182] text-[16px] text-center text-nowrap top-[-1.18px] tracking-[-0.3125px] translate-x-[-50%]">
        <p className="leading-[24px] whitespace-pre">No services selected</p>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Paragraph">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[183.11px] not-italic text-[#717182] text-[14px] text-center top-[0.82px] tracking-[-0.1504px] translate-x-[-50%] w-[324px]">
        <p className="leading-[20px]">Add services from the library to start building your scenario</p>
      </div>
    </div>
  );
}

function ScenarioBuilder() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.997px] h-[135.966px] items-start pb-0 pt-[31.989px] px-0 relative shrink-0 w-[366.207px]" data-name="ScenarioBuilder">
      <Paragraph1 />
      <Paragraph2 />
    </div>
  );
}

function Card10() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[24px] items-center left-[431.99px] p-px rounded-[14px] top-[-0.27px] w-[416.009px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardHeader5 />
      <ScenarioBuilder />
    </div>
  );
}

function CardTitle6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="CardTitle">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-950 text-nowrap tracking-[-0.3125px]">
        <p className="leading-[16px] whitespace-pre">Fee Summary</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="relative shrink-0 w-[165.27px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-[165.27px]" style={{ gap: "5.72205e-06px" }}>
        <CardTitle6 />
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#717182] text-[12px] tracking-[-0.3125px] w-[166px]">
          <p className="leading-[22px]">Summary</p>
        </div>
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="absolute left-[10.91px] size-[15.994px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p13ac8680} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33286" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="bg-white h-[31.989px] relative rounded-[8px] shrink-0 w-[115.795px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.989px] relative w-[115.795px]">
        <Icon19 />
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] left-[36.89px] not-italic text-[12px] text-neutral-950 text-nowrap top-[8px]">
          <p className="leading-[16px] whitespace-pre">Collapse All</p>
        </div>
      </div>
    </div>
  );
}

function ItemLibrary16() {
  return (
    <div className="relative shrink-0 w-full" data-name="ItemLibrary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative w-full">
          <Container60 />
          <Button16 />
        </div>
      </div>
    </div>
  );
}

function CardHeader6() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[8px] items-start px-[24px] py-[12px] relative shrink-0 w-[414.176px]" data-name="CardHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <ItemLibrary16 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[183.43px] not-italic text-[#717182] text-[16px] text-center text-nowrap top-[-1.18px] tracking-[-0.3125px] translate-x-[-50%]">
        <p className="leading-[24px] whitespace-pre">No items selected</p>
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Paragraph">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[183.11px] not-italic text-[#717182] text-[14px] text-center top-[0.82px] tracking-[-0.1504px] translate-x-[-50%] w-[324px]">
        <p className="leading-[20px]">Your fee summary will appear here once you add items to your scenario</p>
      </div>
    </div>
  );
}

function ScenarioBuilder1() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.997px] h-[135.966px] items-start pb-0 pt-[31.989px] px-0 relative shrink-0 w-[366.207px]" data-name="ScenarioBuilder">
      <Paragraph3 />
      <Paragraph4 />
    </div>
  );
}

function Card11() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[24px] items-center left-[863.82px] p-px rounded-[14px] top-[-0.27px] w-[416.009px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardHeader6 />
      <ScenarioBuilder1 />
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute h-[1327.46px] left-[48.18px] top-[593.27px] w-[1280px]" data-name="Container">
      <Card9 />
      <Card10 />
      <Card11 />
    </div>
  );
}

function VersionInfo() {
  return (
    <div className="absolute h-[20px] left-[242.07px] top-0 w-[76.506px]" data-name="VersionInfo">
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
        <p className="leading-[20px] whitespace-pre">v4.0.0.9259</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[20px] relative shrink-0 w-[318.58px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[318.58px]">
        <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] top-[0.82px] tracking-[-0.1504px] w-[235px]">
          <p className="leading-[20px]">areeba © 2025. All Rights Reserved.</p>
        </div>
        <VersionInfo />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="h-[20px] relative shrink-0 w-[47.117px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[47.117px]">
        <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-0 not-italic text-[#717182] text-[14px] text-nowrap top-[0.82px] tracking-[-0.1504px]">
          <p className="leading-[20px] whitespace-pre">Privacy</p>
        </div>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex h-[20px] items-center justify-between relative w-full">
          <Container62 />
          <Link />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[52.898px] items-start left-[48.18px] pb-0 pt-[32.898px] px-0 top-[1968.72px] w-[1280px]" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[0.909px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <Container63 />
    </div>
  );
}

function AppContent8() {
  return (
    <div className="absolute bg-white h-[2037.61px] left-0 top-0 w-[1376.36px]" data-name="AppContent">
      <Container5 />
      <Card3 />
      <Container61 />
      <Footer />
    </div>
  );
}

export default function AreebaPricingSimulator2025() {
  return (
    <div className="bg-white relative size-full" data-name="areeba-Pricing Simulator-2025">
      <AppContent8 />
    </div>
  );
}