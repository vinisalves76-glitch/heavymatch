(function (root) {
  "use strict";
  var F = function (key, label, type, extra) {
    return Object.assign({key: key, label: label, type: type || "text"}, extra || {});
  };
  var groups = [
    {id:"about", title:"Sobre você", icon:"👤", intro:"Conte sobre sua atividade e o tipo de operação. Preencha só o que fizer sentido.", fields:[
      F("display_name","Como gostaria de ser chamado","text",{max:100,placeholder:"Seu nome ou nome comercial"}),
      F("buyer_kind","Você compra como","select",{options:["Pessoa física","Autônomo","Transportadora","Empresa de mineração","Construtora","Agropecuária","Revenda","Outra empresa"]}),
      F("company_name","Empresa ou atividade","text",{max:120,placeholder:"Nome comercial (opcional)"}),
      F("job_role","Sua função","text",{max:100,placeholder:"Motorista, gestor de frota, proprietário..."}),
      F("city","Cidade","text",{max:80}),F("state","Estado (UF)","text",{max:2,placeholder:"MG"}),
      F("whatsapp","WhatsApp de contato","tel",{max:20,placeholder:"(31) 99999-9999"}),
      F("bio","Minha bio","textarea",{max:500,placeholder:"Minha operação, os equipamentos que uso e o próximo negócio que procuro...",wide:true}),
      F("fleet_size","Quantidade de veículos na frota","number",{min:0,max:100000}),
      F("purchase_for","Destino da compra","select",{options:["Uso próprio","Ampliar frota","Substituir equipamento","Revenda","Projeto específico","Ainda pesquisando"]})
    ]},
    {id:"search",title:"O que procura",icon:"🚛",intro:"Defina a máquina ideal. Quanto mais detalhes, melhores poderão ser suas buscas.", fields:[
      F("categories","Categorias de interesse","chips",{options:["Caminhão","Cavalo mecânico","Carreta","Escavadeira","Carregadeira","Retroescavadeira","Trator","Motoniveladora","Outra máquina"],wide:true}),
      F("brands","Marcas de preferência","text",{max:180,placeholder:"Scania, Volvo, Mercedes-Benz, SANY..."}),
      F("models","Modelos procurados","text",{max:180,placeholder:"R 450, FH 540, SY750H..."}),
      F("year_from","Ano mínimo","number",{min:1950,max:2100}),
      F("year_to","Ano máximo","number",{min:1950,max:2100}),
      F("min_power","Potência mínima (cv)","number",{min:0,max:10000}),
      F("max_mileage","Quilometragem máxima (km)","number",{min:0,max:99999999}),
      F("max_hours","Horímetro máximo (h)","number",{min:0,max:99999999}),
      F("axles","Configuração de eixos","select",{options:["Indiferente","4x2","6x2","6x4","8x2","8x4","Outra"]}),
      F("transmission","Câmbio","select",{options:["Indiferente","Automático","Automatizado","Manual"]}),
      F("body_style","Tipo de implemento","text",{max:120,placeholder:"Basculante, prancha, graneleiro..."}),
      F("min_capacity","Capacidade mínima (t)","number",{min:0,max:10000}),
      F("condition","Condição desejada","select",{options:["Indiferente","Novo","Seminovo","Usado","Aceito equipamento para reforma"]}),
      F("location_preference","Localização preferida","text",{max:120,placeholder:"BH, MG, Sudeste, todo o Brasil..."}),
      F("max_distance_km","Distância máxima para negociar (km)","number",{min:0,max:20000}),
      F("quantity","Quantos equipamentos deseja","number",{min:1,max:10000}),
      F("must_haves","Itens indispensáveis","textarea",{max:500,placeholder:"Suspensão, cabine, hidráulico, acessórios, histórico de manutenção...",wide:true})
    ]},
    {id:"payment",title:"Orçamento e compra",icon:"💰",intro:"Dados comerciais ajudam a encontrar propostas compatíveis. Não informe senhas nem dados bancários.",fields:[
      F("budget_min","Orçamento mínimo (R$)","number",{min:0,max:1000000000}),
      F("budget_max","Orçamento máximo (R$)","number",{min:0,max:1000000000}),
      F("payment_methods","Formas de pagamento aceitas","chips",{options:["À vista","Financiamento","Consórcio","Troca + diferença","Parcelamento com vendedor","A combinar"],wide:true}),
      F("down_payment","Entrada disponível (R$)","number",{min:0,max:1000000000}),
      F("financing_preapproved","Financiamento pré-aprovado?","yesno"),
      F("need_financing_help","Precisa de ajuda para financiar?","yesno"),
      F("credit_letter","Tem carta de crédito/consórcio?","yesno"),
      F("installments","Parcelas desejadas","select",{options:["Até 12","Até 24","Até 36","Até 48","Até 60","Acima de 60","A negociar"]}),
      F("purchase_deadline","Quando pretende comprar?","select",{options:["Imediatamente","Em até 30 dias","Em até 90 dias","Em até 6 meses","Sem prazo definido"]}),
      F("needs_invoice","Necessita de nota fiscal?","yesno"),
      F("open_to_negotiation","Aceita negociar valor?","yesno"),
      F("transport_arrangement","Transporte do equipamento","select",{options:["Posso retirar","Preciso de entrega","A negociar"]}),
      F("payment_notes","Observações sobre a negociação","textarea",{max:400,wide:true,placeholder:"Ex.: entrada de R$ 100 mil e saldo financiado"})
    ]},
    {id:"trade",title:"Veículo para troca",icon:"🔄",intro:"Se tem caminhão ou máquina para oferecer na negociação, descreva aqui.",fields:[
      F("has_trade","Tem equipamento para dar de troca?","yesno"),
      F("trade_category","Tipo de equipamento","select",{options:["Caminhão","Cavalo mecânico","Carreta","Escavadeira","Carregadeira","Retroescavadeira","Outro"]}),
      F("trade_brand","Marca","text",{max:80,placeholder:"Scania, Volvo, SANY..."}),
      F("trade_model","Modelo","text",{max:120,placeholder:"Ex.: R 440"}),
      F("trade_year","Ano","number",{min:1950,max:2100}),
      F("trade_mileage","Quilometragem (km)","number",{min:0,max:99999999}),
      F("trade_hours","Horímetro (h)","number",{min:0,max:99999999}),
      F("trade_value","Valor estimado (R$)","number",{min:0,max:1000000000}),
      F("trade_financed","Possui financiamento ativo?","yesno"),
      F("trade_balance","Saldo devedor aproximado (R$)","number",{min:0,max:1000000000}),
      F("trade_condition","Estado de conservação","select",{options:["Excelente","Bom","Regular","Precisa de manutenção"]}),
      F("trade_city","Cidade onde está o veículo","text",{max:80}),
      F("trade_state","Estado (UF) do veículo","text",{max:2}),
      F("trade_documentation","Situação documental","select",{options:["Em dia","Em regularização","Prefiro informar na negociação"]}),
      F("trade_difference","Aceita pagar diferença na troca?","yesno"),
      F("trade_description","Descrição e detalhes do equipamento","textarea",{max:600,placeholder:"Pneus, revisões, implemento, reparos necessários...",wide:true})
    ]},
    {id:"preferences",title:"Preferências",icon:"⚙️",intro:"Você controla como quer negociar e quais informações deseja fornecer.",fields:[
      F("preferred_contact","Como prefere conversar","select",{options:["WhatsApp","Telefone","E-mail","Videochamada","Indiferente"]}),
      F("best_contact_time","Melhor horário para contato","select",{options:["Manhã","Tarde","Noite","Horário comercial","Qualquer horário"]}),
      F("available_video","Aceita apresentar ou ver equipamentos por videochamada?","yesno"),
      F("decision_maker","Você decide a compra?","select",{options:["Sim","Em conjunto com outras pessoas","Só estou pesquisando"]}),
      F("delivery_urgency","Precisa do equipamento em quanto tempo?","select",{options:["Imediatamente","Em até 30 dias","Em até 90 dias","Sem urgência"]}),
      F("maintenance_history","Histórico de manutenção é indispensável?","yesno"),
      F("inspections","Pretende vistoriar antes de comprar?","yesno"),
      F("negotiation_notes","Outras preferências","textarea",{max:500,placeholder:"Documentação, região, vistoria, garantia...",wide:true}),
      F("allow_contact","Autorizo contato comercial sobre minha busca","check",{wide:true}),
      F("allow_recommendations","Quero ver recomendações de anúncios compatíveis quando o recurso estiver disponível","check",{wide:true})
    ]}
  ];
  var allFields=groups.reduce(function(list,group){return list.concat(group.fields);},[]);
  var keys=allFields.map(function(field){return field.key;});
  function sanitize(input) {
    var data=input&&typeof input==="object"&&!Array.isArray(input)?input:{};
    var clean={};
    allFields.forEach(function(field){
      var value=data[field.key];
      if(field.type==="check") {clean[field.key]=value===true;return;}
      if(field.type==="chips"){
        var list=Array.isArray(value)?value:[];
        clean[field.key]=list.filter(function(item){return field.options.includes(item);}).slice(0,field.options.length).filter(function(item,index,array){return array.indexOf(item)===index;});
        return;
      }
      if(field.type==="number"){
        if(value===null||value===undefined||String(value).trim()===""){clean[field.key]="";return;}
        var number=Number(value);
        clean[field.key]=Number.isFinite(number)&&number>=field.min&&number<=field.max?String(number):"";
        return;
      }
      var text=typeof value==="string"?value.trim().slice(0,field.max||120):"";
      if(field.type==="select"||field.type==="yesno"){
        var options=field.type==="yesno"?["Sim","Não","A definir"]:field.options;
        clean[field.key]=options.includes(text)?text:"";
      }else clean[field.key]=text;
    });
    if(clean.has_trade!=="Sim"){
      allFields.filter(function(f){return f.key.startsWith("trade_");}).forEach(function(field){clean[field.key]=field.type==="check"?false:field.type==="chips"?[]:"";});
    }
    return clean;
  }
  function progress(data){
    var clean=sanitize(data);
    // Quem não possui equipamento de troca não deve ser penalizado por campos ocultos.
    var relevant=allFields.filter(function(field){
      return clean.has_trade==="Sim"||!field.key.startsWith("trade_");
    });
    var completed=relevant.filter(function(field){
      var value=clean[field.key];
      return Array.isArray(value)?value.length>0:typeof value==="boolean"?value:!!value;
    }).length;
    return {filled:completed,total:relevant.length,percent:Math.round(completed/relevant.length*100)};
  }
  root.hmBuyerProfileModel={version:1,metadataKey:"hm_buyer_profile_v1",groups:groups,keys:keys,sanitize:sanitize,progress:progress};
})(typeof window==="undefined"?globalThis:window);